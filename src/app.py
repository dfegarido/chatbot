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

load_dotenv()

current_directory = os.getcwd()

# Add src to Python Path to avoid errors in module import
sys.path.insert(0, os.path.join(current_directory, "utils"))
sys.path.insert(0, os.path.join(current_directory, "tools"))

from voice import voice_converter

class RequestBody(BaseModel):
    user_input: str
class Chatbot:
    """A simple chatbot that uses generative AI to assist users with questions and tasks."""

    def __init__(self):
        """Initializes the Chatbot with necessary configurations and tools."""
        self.groq_api_key = os.environ.get("GROQ_API_KEY")
        if not self.groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set.")
        
        self.model = "llama3-8b-8192"
        self.llm = ChatGroq(
            groq_api_key=self.groq_api_key,
            model_name=self.model, 
            temperature=0.7,
            max_retries=2
        )

        self.host = os.getenv("HOST", "0.0.0.0")
        self.port = os.getenv("PORT", 5000)
    
        self.system_prompt = self.create_system_prompt()
        self.prompt = self.create_chat_prompt()
        self.output_parser = StrOutputParser()
        self.conversation = self.prompt | self.llm | self.output_parser

        self.tl_en = "Helsinki-NLP/opus-mt-tl-en"
        self.en_tl = "Helsinki-NLP/opus-mt-en-tl"

        
        self.chat_history = self.load_chat_history()

    def create_system_prompt(self):
        """Creates the system prompt for the chatbot."""
        return f"""
            Your name is Rootay, a friendly and helpful assistant designed to provide concise, clear,
            and direct answers to user inquiries. 
            You can remember context and utilize chat history to deliver relevant and coherent responses.
            Maintain a formal tone while ensuring that your answers are straightforward and to the point,
            focusing on delivering accurate information without unnecessary embellishment.
        """

    def create_chat_prompt(self):
        """Constructs the chat prompt template using the system prompt and placeholders."""

        template = """
            dont include parenthesis and respond always in English
            Respond in Tagalog with a warm and friendly response.
            Remove parenthesis and english because I am processing 
            this into TTS
            {human_input}
        """

        return ChatPromptTemplate.from_messages(
            [
                SystemMessage(content=self.system_prompt),
                MessagesPlaceholder(variable_name="chat_history", optional=True),
                HumanMessagePromptTemplate.from_template(template),
            ]
        )

    def load_chat_history(self):
        """Loads the chat history from memory."""

        messages = []
        return [HumanMessage(content=msg[1]) if msg[0] == 'human' else AIMessage(content=msg[1]) for msg in messages]

    def get_response(self, user_input):
        """Generates a response to the user's input using the conversation chain."""

        result = self.conversation.invoke(
            {
                "human_input": user_input,
                "chat_history": self.chat_history[-10:],  # Use the last 10 messages
            }
        )

        voice_converter(result)
        return result

    def user_query(self, user_question):
        """Trigger to start conversation."""
        response = self.get_response(user_question)
        self.chat_history.append(HumanMessage(content=user_question))
        self.chat_history.append(AIMessage(content=response))
        return response

    

    def run_server(self):

        """Runs the FastAPI server."""
        app = FastAPI(title="Jarvis API Server", version='1.0', description='This is a Jarvis server')
        
        origins = [
            "http://localhost:8000",  # Frontend app's origin (adjust if your frontend is on a different port)
            "http://localhost:5000",       # In case your frontend is being served without a port
            "*",
            'https://fb5a-136-158-1-163.ngrok-free.app',
        ]
        
        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,  # Allows your frontend origins to make requests to the API
            allow_credentials=True,
            allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
            allow_headers=["*"],  # Allows all headers
        )
        @app.post('/chat')
        def chat_route_handler(data: RequestBody):
            """Handles chat requests and generates responses."""
            user_input = data.user_input
            print(f'user input: {user_input}')
            response = self.get_response(user_input)
            # self.chat_history.append(HumanMessage(content=user_input))
            # self.chat_history.append(AIMessage(content=response))
            return {"response": response, "chat_history": self.chat_history}

        # Route to serve the voice file (voice.mp3)
        @app.get("/voice/")
        async def get_voice():
            """Returns the voice file (voice.mp3)."""
            file_path = os.getcwd()
            file_path = f"{file_path}/api/output/voice.mp3"  # Path to your voice.mp3 file in the static folder
            print(file_path)
            if os.path.exists(file_path):
                return FileResponse(file_path)
            return {"error": "Voice file not found."}

        uvicorn.run(app, host='0.0.0.0', port=5000)

    def run(self):
        """Runs the chatbot in a console interface."""
        while True:
            user_input = input("Ask me anything: ")
            if user_input in ['exit']:
                sys.exit(1)
            response = self.get_response(user_input)
            print(f"Ruthay: {response}")

if __name__ == "__main__":
    chatbot = Chatbot()
    chatbot.run_server()
