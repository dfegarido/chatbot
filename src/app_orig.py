import os
import sys
from datetime import datetime
from dotenv import load_dotenv
from fastapi import FastAPI, Query
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn
import asyncio

from langchain_core.prompts import (
    ChatPromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder
)
from langchain.prompts import PromptTemplate
from langchain_core.messages import SystemMessage, AIMessage, HumanMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq
from langchain_ollama.llms import OllamaLLM
from langserve import add_routes

# Add custom paths to Python Path
current_directory = os.getcwd()
sys.path.insert(0, os.path.join(current_directory, "utils"))
sys.path.insert(0, os.path.join(current_directory, "tools"))

# Internal Imports
from speak import speak_now
from memory import Memory
from news import query_news, news_update, get_all_news
from thoughts import random_thoughts
from home_assistant_api import HomeAssistantTool

# Load environment variables
load_dotenv()



class RequestBody(BaseModel):
    """Schema for the user input data."""
    user_input: str


class Chatbot:
    """A simple chatbot that uses generative AI to assist users with questions and tasks."""

    def __init__(self):
        """Initializes the chatbot with configurations and necessary tools."""
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        if not self.groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set.")
        
        self.model = "llama-3.1-8b-instant"
        self.llm = self._initialize_llm()
        self.memory = Memory()
        self.chat_history = self.load_chat_history()
        self.prompt = self.create_chat_prompt()
        self.output_parser = StrOutputParser()
        self.conversation = self.prompt | self.llm | self.output_parser
        self.news_query = None
        self.home_assistant = HomeAssistantTool()
        self.home_assistant.llm = self.llm
        self.home_assistant.output_parser = self.output_parser
        self.tl_en = "Helsinki-NLP/opus-mt-tl-en"
        self.en_tl = "Helsinki-NLP/opus-mt-en-tl"

    def _initialize_llm(self):
        """Initializes the appropriate language model (LLM) based on the environment."""
        if os.getenv("ENV", "DEV").lower() == "dev" :
            return OllamaLLM(
                base_url="http://localhost:11434", 
                model="llama3.2:3b",
                temperature = 0.8,
                num_predict = 256
                )
        return ChatGroq(
            groq_api_key=self.groq_api_key,
            model_name=self.model,
            temperature=0.7,
            max_retries=2
        )

    @property
    def system_prompt(self):
        """Generates the system prompt for the chatbot."""
        return """
            Your name is Jarvis, you are a friendly conversational assistant. 
            You're funny and always give short answers.
            Let’s keep the conversation going—what would you like help with next? 😊

            Using this data: {tools_data}

            Respond to this prompt: {human_input}
        """

    def create_chat_prompt(self):
        """Creates the chat prompt template using the system prompt."""
        return ChatPromptTemplate.from_messages(
            [
                SystemMessage(content=self.system_prompt),
                MessagesPlaceholder(variable_name="chat_history", optional=True),
                MessagesPlaceholder(variable_name="tools_data", optional=True),
                HumanMessagePromptTemplate.from_template("{human_input}"),
            ]
        )

    def load_chat_history(self):
        """Loads chat history from memory."""
        messages = self.memory.get_messages()
        return [AIMessage(content=msg[1]) for msg in messages]

    @property
    def list_of_tools(self):
        """Returns a list of available tools and their definitions."""
        return [
            {"name": "news_tool", "definition": "Fetches and provides current news data."},
            {"name": "date_tool", "definition": "Provides information related to calendar dates."},
            {"name": "time_tool", "definition": "Provides information about time and time zones."},
            {"name": "location_tool", "definition": "Fetches data related to geographical locations."},
            {"name": "update_news_tool", "definition": "Fetches and updates current news data."},
            {"name": "home_assistant_tool", "definition": "Manages smart home tasks, controls devices, xbox, and handles general queries."},
            {"name": "other_tool", "definition": "Handles queries that don't fall into the above categories."}
        ]


    def select_related_tool(self, query):
        """Selects the most relevant tool based on the user's query."""
        template = (
                "Based on this query {user_input}, select the most relevant tool. "
                "Respond only with the tool name from the following list: "
                f"""[{', '.join([f"{tool['name']}: {tool['definition']}" for tool in self.list_of_tools])}]"""
            )
        prompt = PromptTemplate(input_variables=["user_input"], template=template)
        generate = prompt | self.llm
        return generate.invoke(query)

    def check_relevance(self, query, context):
        """Checks if the query is relevant to the context."""
        template = f"""
        Check if the query "{query}" is relevant to the context. Respond with "yes" or "no".
        context: {context}
        """
        prompt = PromptTemplate(template=template)
        generate = prompt | self.llm
        return generate.invoke({})

    def generate_question(self, query):
        """Generates a follow-up question based on the user's query."""
        template = f"""
        Generate one easy-to-understand, short question based on the query:
        "{query}"
        """
        prompt = PromptTemplate(template=template)
        generate = prompt | self.llm
        return generate.invoke({})

    def get_response(self, user_input):
        """Generates a response to the user's input, considering tool relevance and context."""
        tool_count = 0
        while True:
            tool_use = self.select_related_tool({"user_input": user_input})
            is_relevant = self.check_relevance(user_input, tool_use)
            print(f"tool_use: {tool_use}")
            print(f"is_relevant: {is_relevant}")
            print(" ")

            if "yes" in is_relevant.lower() or "other_tool" in tool_use:
                if "other_tool" in tool_use:
                    tool_count += 1
                    if tool_count == 3:
                        break
                else:
                    break
                
            
            user_input = self.generate_question(user_input)
            print(f"new question: {user_input}")
            print(" ")


        tool_content = ""
        if "news_tool" in tool_use:
            tool_content = query_news(user_input)
        elif "update_news_tool" in tool_use:
            # news_update()
            tool_content = f"News update triggered successfully. {get_all_news()}"
        elif "home_assistant_tool" in tool_use:
            tool_content = self.home_assistant.generate(user_input)


        result = self.conversation.invoke({
            "human_input": user_input,
            # "chat_history": self.chat_history[-20:],  # Use the last 20 messages
            "chat_history": [],  # Use the last 20 messages
            "tools_data": [{"role": "system", "content": tool_content}],
        })
        return speak_now(result)

    def user_query(self, user_question):
        """Handles a user query, generates a response, and updates memory."""
        response = self.get_response(user_question)
        self.chat_history.append(AIMessage(content=response))
        self.memory.add_message(user_question, response)
        return response

    def run_server(self):
        """Sets up and runs the FastAPI server."""
        app = FastAPI(title="Jarvis API Server", version='1.0', description='This is a Jarvis server')
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        app.mount("/static", StaticFiles(directory="static"), name="static")

        @app.get("/", response_class=HTMLResponse)
        async def get_index():
            """Serves the index.html file from the static folder."""
            file_path = os.path.join(os.getcwd(), "static", "index.html")
            if os.path.exists(file_path):
                return FileResponse(file_path)
            return {"error": "index.html not found."}

        @app.post('/chat')
        def chat_route_handler(data: RequestBody):
            """Handles chat requests and generates responses."""
            user_input = data.user_input
            response = self.user_query(user_input) if len(user_input) > 0 else " "
            return {"response": response, "chat_history": self.chat_history}

        @app.get("/voice/")
        async def get_voice():
            """Returns the voice file (voice.mp3)."""
            file_path = os.path.join(os.getcwd(), "api", "output", "voice.mp3")
            if os.path.exists(file_path):
                return FileResponse(file_path)
            return {"error": "Voice file not found."}

        host = os.getenv("SERVER_URL", "0.0.0.0")
        port = int(os.getenv("SERVER_PORT", 5000))
        uvicorn.run(app, host=host, port=port)

    def run(self):
        """Runs the chatbot in a console interface."""
        while True:
            user_input = input("Ask me anything: ")
            if user_input.lower() == 'exit':
                sys.exit(1)
            response = self.user_query(user_input)
            print(f"Ruthay: {response}")


if __name__ == "__main__":
    chatbot = Chatbot()
    env = os.getenv("ENV", "dev")
    if env.lower() == "dev":
        chatbot.run()
    else:
        chatbot.run_server()
