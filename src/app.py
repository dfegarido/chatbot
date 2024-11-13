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


class RequestBody(BaseModel):
    user_input: str


class Chatbot:
    """A simple chatbot that uses generative AI to assist users with questions and tasks."""

    def __init__(self):
        """Initializes the Chatbot with necessary configurations and tools."""
        self.groq_api_key = os.environ.get("GROQ_API_KEY")
        if not self.groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set.")
        
        self.model = "llama3.2:3b"
        self.llm = OllamaLLM(base_url="http://localhost:11434", model=self.model)
    
        self.prompt = self.create_chat_prompt()
        self.output_parser = StrOutputParser()
        self.conversation = self.prompt | self.llm | self.output_parser

        self.tl_en = "Helsinki-NLP/opus-mt-tl-en"
        self.en_tl = "Helsinki-NLP/opus-mt-en-tl"
        self.memory = Memory()
        self.chat_history = self.load_chat_history()

    @property
    def system_prompt(self):
        """Creates the system prompt for the chatbot."""
        return """
            You’re a friendly, helpful assistant, skilled at simplifying things so users never feel lost. Provide clear, concise answers and guide users through instructions directly. Always summarize and answer in one line without extra characters.
            """

    def create_chat_prompt(self):
        """Constructs the chat prompt template using the system prompt and placeholders."""

        template = """
            Hey there! Let's pick up from where we left off:

            Previous conversation:
            {chat_history}

            This is my question:
            {human_input}
            """

        return ChatPromptTemplate.from_messages(
            [
                SystemMessage(content=self.system_prompt),
                HumanMessagePromptTemplate.from_template(template),
            ]
        )

    def load_chat_history(self):
        """Loads the chat history from memory."""

        messages = self.memory.get_messages()
        return [AIMessage(content=msg[1]) for msg in messages]

    async def get_response(self, user_input):
        """Generates a response to the user's input using the conversation chain."""
        result = await asyncio.to_thread(self.conversation.invoke, {
                "human_input": user_input,
                "chat_history": self.chat_history[-20:],  # Use the last 10 messages
            })
        env = os.getenv("ENV", "dev")
        return speak(result) if env.lower() == "dev" else voice_converter(result) 


    async def user_query(self, user_question):
        """Trigger to start conversation."""
        response = await self.get_response(user_question)
        self.chat_history.append(HumanMessage(content=user_question))
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
        @app.post('/chat')
        async def chat_route_handler(data: RequestBody):
            """Handles chat requests and generates responses."""
            user_input = data.user_input
            response = await self.get_response(user_input)
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
        port = os.getenv("SERVER_PORT", 5000)
        uvicorn.run(app, host=host, port=port)

    async def run(self):
        """Runs the chatbot in a console interface."""
        while True:
            print(" ")
            user_input = input("Ask me anything: ")
            if user_input in ['exit']:
                sys.exit(1)
            response = await self.user_query(user_input)
            print(" ")
            print(f"Ruthay: {response}")

if __name__ == "__main__":
    chatbot = Chatbot()
    env = os.getenv("ENV", "dev")
    if env.lower() == "dev":
        asyncio.run(chatbot.run())
    else:
        chatbot.run_server()
