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
from fastapi import FastAPI
from langserve import add_routes
import uvicorn

load_dotenv()

# Add src to Python Path to avoid errors in module import
sys.path.insert(0, os.path.abspath("./utils/"))
sys.path.insert(0, os.path.abspath("./tools/"))

from translator import translate
from voice import voice_converter


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
            and direct answers to user inquiries. You can remember context and utilize chat history
            to deliver relevant and coherent responses. Engage with a conversational tone that includes
            appropriate humor and empathy, making each interaction enjoyable for the user.
        """

    def create_chat_prompt(self):
        """Constructs the chat prompt template using the system prompt and placeholders."""

        template = """
            dont include parenthesis and respond always in English
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
        translated = translate(user_input, model_id=self.tl_en)
        result = self.conversation.invoke(
            {
                "human_input": translated,
                "chat_history": self.chat_history[-10:],  # Use the last 10 messages
            }
        )

        return translate(result, model_id=self.en_tl)

    def user_query(self, user_question):
        """Trigger to start conversation."""
        response = self.get_response(user_question)
        self.chat_history.append(HumanMessage(content=user_question))
        self.chat_history.append(AIMessage(content=response))
        return response

    def chat_route_handler(self, request):
        """Handles chat requests and generates responses."""
        user_input = request.get("user_input")
        response = self.get_response(user_input)
        self.chat_history.append(HumanMessage(content=user_input))
        self.chat_history.append(AIMessage(content=response))
        return {"response": response, "chat_history": self.chat_history}

    def run_server(self):
        """Runs the FastAPI server."""
        app = FastAPI(title="Jarvis API Server", version='1.0', description='This is a Jarvis server')
        add_routes(app, self.conversation, path='/chat')
        uvicorn.run(app, host='0.0.0.0', port=8000)

    def run(self):
        """Runs the chatbot in a console interface."""
        while True:
            user_input = input("Ask me anything: ")
            if user_input in ['exit']:
                sys.exit(1)
            response = self.get_response(user_input)
            print(f"Ruthay: {response}")
            voice_converter(response)

if __name__ == "__main__":
    chatbot = Chatbot()
    chatbot.run()
