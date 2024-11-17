import os
import sys
from datetime import datetime
from langchain_core.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)
from langchain_core.messages import SystemMessage, AIMessage, HumanMessage
from langchain_groq import ChatGroq
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
from fastapi import FastAPI, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from langserve import add_routes
import uvicorn
from pydantic import BaseModel
from fastapi.responses import FileResponse
import asyncio
from langchain_ollama.llms import OllamaLLM

load_dotenv()

current_directory = os.getcwd()

# Add src to Python Path to avoid errors in module import
sys.path.insert(0, os.path.join(current_directory, "utils"))
sys.path.insert(0, os.path.join(current_directory, "tools"))

from voice import voice_converter
from speak import speak
from memory import Memory
from news import query_news, news_update, get_all_news



class RequestBody(BaseModel):
    user_input: str


class Chatbot:
    """A simple chatbot that uses generative AI to assist users with questions and tasks."""

    def __init__(self):
        """Initializes the Chatbot with necessary configurations and tools."""
        self.groq_api_key = os.environ.get("GROQ_API_KEY")
        if not self.groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set.")
        
        self.model = "llama-3.1-8b-instant"
        if os.getenv("ENV", "DEV").lower() == 'dev':
            self.llm = OllamaLLM(base_url="http://localhost:11434", model="llama3.2:3b")
        else:
            self.llm = ChatGroq(
                groq_api_key=self.groq_api_key,
                model_name=self.model, 
                temperature=0.7,
                max_retries=2
            )
        
        self.memory = Memory()
        self.chat_history = self.load_chat_history()
        self.prompt = self.create_chat_prompt()
        self.output_parser = StrOutputParser()
        self.conversation = self.prompt | self.llm | self.output_parser

        self.news_query = None

        self.tl_en = "Helsinki-NLP/opus-mt-tl-en"
        self.en_tl = "Helsinki-NLP/opus-mt-en-tl"
        

    @property
    def system_prompt(self):
        """Creates the system prompt for the chatbot."""
        return """
            Hey there! I'm here to help you out. 
            My goal is to make things super simple so you never feel lost. 
            I'll give you clear and easy-to-understand answers, and I'll guide you through any steps directly. 
            If you ever have more questions or need me to explain something differently, just let me know!

            Let’s keep the conversation going—what would you like help with next? 😊
            Using this data : {tools_data}

            Respond to this prompt:
            {human_input}
            """

    def create_chat_prompt(self):
        """Constructs the chat prompt template using the system prompt and placeholders."""


        return ChatPromptTemplate.from_messages(
            [
                SystemMessage(content=self.system_prompt),
                MessagesPlaceholder(
                    variable_name="chat_history",
                    optional=True
                ),
                MessagesPlaceholder(
                    variable_name="tools_data",
                    optional=True
                ),
                HumanMessagePromptTemplate.from_template("{human_input}"),
            ]
        )

    def load_chat_history(self):
        """Loads the chat history from memory."""

        messages = self.memory.get_messages()
        return [AIMessage(content=msg[1]) for msg in messages]

    def select_related_tool(self, query):
        template = f"""
            Base on this query '{query['user_input']}' select the most relevant tool.
            No other message just direct answer.

            answer only from this lists:
            [{[f"{tool['name']} : {tool['definition']}," for tool in self.list_of_tools]}]
        """
        prompt = ChatPromptTemplate.from_messages([SystemMessage(content=template)])

        generate = prompt | self.llm | self.output_parser
        return generate.invoke(query)

    @property
    def list_of_tools(self):
        return [
                    {
                        "name": "news_tool",
                        "definition": "Provides data related to current news, including articles, headlines, and updates across various topics such as politics, technology, sports, weather, etc."
                    },
                    {
                        "name": "date_tool",
                        "definition": "Provides data related to dates, including specific calendar dates, days of the week, holidays, and other time-related information."
                    },
                    {
                        "name": "time_tool",
                        "definition": "Provides data related to the current time, time zones, and conversions between different time zones or specific times in the past and future."
                    },
                    {
                        "name": "location_tool",
                        "definition": "Provides data related to geographical locations, including places, coordinates (latitude/longitude), landmarks, and regions."
                    },
                    {
                        "name": "update_news_tool",
                        "definition": "To trigger the function to get the latest news from website and store it to database"
                    },
                    {
                        "name": "other_tool",
                        "definition": "Handles queries that don't match any of the categories above, providing relevant information or responses based on other tools or general knowledge."
                    },

                ]


    def check_relevance(self, query, context):
        """Checks if the query is relevant to the current context."""
        # Define the template with placeholders for query and context
        template = """
        Check if the query "{query}" is relevant to the context.
        Respond only with "yes" or "no".
        context: {context}
        """
        
        # Properly format the template with actual query and context values
        formatted_template = template.format(query=query, context=context)
        
        # Create a prompt using the formatted template
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=formatted_template)
        ])
        
        # Generate a response by invoking the prompt with the LLM and output parser
        generate = prompt | self.llm | self.output_parser
        return generate.invoke({})

    def generate_question(self, query):
        """Generates a question based on the query and context."""

        # Define the template with placeholders for query and context
        template = """
            Generate one question based on the query 
            Make it easy to understand and short.
            Just one question.
            "{query}".
            
        """
        
        # Properly format the template with actual query and context values
        formatted_template = template.format(query=query)
        
        # Create a prompt using the formatted template
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=formatted_template)
        ])
        
        # Generate a response by invoking the prompt with the LLM and output parser
        generate = prompt | self.llm | self.output_parser
        return generate.invoke({})



    def get_response(self, user_input):
        """Generates a response to the user's input using the conversation chain."""

        while True:
            tool_use = self.select_related_tool({"user_input": user_input})
            is_relevant = self.check_relevance(user_input, tool_use)
            print(f'tool use {tool_use}')
            print(f'is relevant {is_relevant}')
            if "yes" in is_relevant.lower() or "other_tool" in tool_use:
                break
            user_input = self.generate_question(user_input)
            print(f'New question {user_input}')


        tool_content = ""
        if "news_tool" in tool_use:
            tool_content = query_news(user_input)
        if "update_news_tool" in tool_use:
            news_update()
            tool_content = f"News update triggered successfully. {get_all_news()}"

        result = self.conversation.invoke({
                "human_input": user_input,
                "chat_history": [],  # Use the last 10 messages
                "tools_data": [{
                    "role":"system",
                    "content": tool_content
                }],
        })

        env = os.getenv("ENV", "dev")
        return speak(result) if env.lower() == "dev" else voice_converter(result) 


    def user_query(self, user_question):
        """Trigger to start conversation."""
        response = self.get_response(user_question)

        self.chat_history.append(AIMessage(content=response))
        self.memory.add_message(user_question, response)
        return response

    
    def run_server(self):

        """Runs the FastAPI server."""
        app = FastAPI(title="Jarvis API Server", version='1.0', description='This is a Jarvis server')
        
        origins = [
            "*",
        ]
        
        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,  # Allows your frontend origins to make requests to the API
            allow_credentials=True,
            allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
            allow_headers=["*"],  # Allows all headers
        )

        # Serve static files (e.g., index.html, JavaScript, CSS)
        app.mount("/static", StaticFiles(directory="static"), name="static")

        # Serve the index.html file on the root path
        @app.get("/", response_class=HTMLResponse)
        async def get_index():
            """Serves the index.html file."""
            file_path = os.path.join(os.getcwd(), "static", "index.html")
            if os.path.exists(file_path):
                return FileResponse(file_path)
            return {"error": "index.html not found."}


        @app.post('/chat')
        def chat_route_handler(data: RequestBody):
            """Handles chat requests and generates responses."""
            user_input = data.user_input
            response = self.get_response(user_input)
            self.chat_history.append(HumanMessage(content=user_input))
            self.chat_history.append(AIMessage(content=response))
            self.memory.add_message(user_input, response)
            return {"response": response, "chat_history": self.chat_history}

        # Route to serve the voice file (voice.mp3)
        @app.get("/voice/")
        async def get_voice():
            """Returns the voice file (voice.mp3)."""
            file_path = os.getcwd()
            file_path = f"{file_path}/api/output/voice.mp3"  # Path to your voice.mp3 file in the static folder
            if os.path.exists(file_path):
                return FileResponse(file_path)
            return {"error": "Voice file not found."}

        host = os.getenv("SERVER_URL", "0.0.0.0")
        port = int(os.getenv("SERVER_PORT", 5000))
        uvicorn.run(app, host=host, port=port)

    def run(self):
        """Runs the chatbot in a console interface."""
        while True:
            print(" ")
            user_input = input("Ask me anything: ")
            if user_input in ['exit']:
                sys.exit(1)
            response = self.user_query(user_input)
            print(" ")
            print(f"Ruthay: {response}")

if __name__ == "__main__":
    chatbot = Chatbot()
    env = os.getenv("ENV", "dev")
    if env.lower() == "dev":
        chatbot.run()
    else:
        chatbot.run_server()
