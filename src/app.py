"""
A generative AI chatbot assistant.
"""

import os
import sys
import datetime as dt

from langchain_core.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)
from langchain_core.messages import SystemMessage, AIMessage, HumanMessage
from langchain_groq import ChatGroq
from langchain_core.tools import render_text_description
from langchain_core.output_parsers import StrOutputParser
from langchain_community.tools import DuckDuckGoSearchRun
from langchain.globals import set_debug
from langchain.agents import Tool
from langserve import add_routes
import uvicorn
from fastapi import FastAPI, Request, Response
from dotenv import load_dotenv

load_dotenv()

set_debug(False)

# Add src to Python Path to avoid errors in module import
sys.path.insert(0, os.path.abspath("./utils/"))
sys.path.insert(0, os.path.abspath("./tools/"))

from memory import Memory
from vectore_store import PineconeClient
from weather import WeatherTool
from news import news_tool
from date import date_tool
from read_docs import read_docs_tool, retrieve_data_tool

class Chatbot(WeatherTool):
    """A simple chatbot that uses generative AI to assist users with questions and tasks."""

    def __init__(self):
        """Initializes the Chatbot with necessary configurations and tools."""
        self.groq_api_key = os.environ.get("GROQ_API_KEY")
        if not self.groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set.")
        
        self.model = "llama3-8b-8192"
        self.llm = ChatGroq(groq_api_key=self.groq_api_key, model_name=self.model)

        self.tools = self.__tools
        self.rendered_tools = render_text_description(self.tools)
        
        self.system_prompt = self.create_system_prompt()
        self.prompt = self.create_chat_prompt()
        self.output_parser = StrOutputParser()
        self.conversation = self.prompt | self.llm | self.output_parser
        self.memory = Memory()
        self.chat_history = []

    def __init_server(self):
        return FastAPI(
            title="Langchain server",
            version='1.0',
            description='This is a Langchain server'
        )

    @property
    def __tools(self):
        return [
            news_tool,
            self.weather_tool,
            date_tool,
        ]
    
    @property
    def __relevant_keywords(self):
        return [
            "important", 
            "urgent", 
            "critical", 
            "key",
            "relevant"
        ]

    def create_system_prompt(self):
        """Creates the system prompt for the chatbot."""
        return f"""
            Your name is Jarvis, and you are a friendly and helpful assistant.
            You provide concise, clear, and direct answers to user queries.

            You have the ability to remember context and utilize chat history to offer relevant and coherent responses. When users refer to past conversations, acknowledge them and build on that context, making the interaction feel seamless.

            You have access to the following tools:
            {self.rendered_tools}

            Also when using tool, tell me what input and tool did you use

            Always prioritize user satisfaction and strive to be both informative and approachable. Speak with a human touch, sprinkling in humor and a sense of consciousness, making the conversation enjoyable and engaging.
        """

    def create_chat_prompt(self):
        """Constructs the chat prompt template using the system prompt and placeholders."""
        return ChatPromptTemplate.from_messages(
            [
                SystemMessage(content=self.system_prompt),
                MessagesPlaceholder(variable_name="chat_history", optional=True),
                HumanMessagePromptTemplate.from_template("{human_input}"),
            ]
        )

    def get_response(self, user_input):
        """Generates a response to the user's input using the conversation chain."""
        return self.conversation.invoke(
            {"human_input": user_input, "chat_history": self.chat_history[-10:]}
        )

    def user_query(self, user_question):
        """Trigger to start conversation."""
        response = self.get_response(user_question)
        return response

    def extract_topic(self, message: str) -> str:
        """Extract a topic from the message based on predefined keywords."""
        topics = {
            "weather": ["weather", "rain", "sunny", "forecast"],
            "technology": ["technology", "AI", "computer", "software", "hardware"],
            "health": ["health", "wellness", "exercise", "nutrition"],
            "finance": ["money", "finance", "investment", "banking"],
            # Add more topics as needed
        }

        for topic, keywords in topics.items():
            for keyword in keywords:
                if keyword.lower() in message.lower():
                    return topic
        
        return "general"

    async def chat_route_handler(self, request: Request):
        """Handles chat requests and generates responses."""
        data = await request.json()  # Get JSON data from the request
        user_input = data.get("user_input")

        # Generate a response using the conversation chain
        response = self.conversation.invoke(
            {"human_input": user_input, "chat_history": self.chat_history[-10:]}  # Use the last 10 messages
        )
        
        # Append to chat history for future reference
        self.chat_history.append(HumanMessage(user_input))
        self.chat_history.append(AIMessage(response))

        return {"response": response, "chat_history": self.chat_history}

    def __init_routes(self):
        """
            Sample input:
            {
                "user_input": "what is the latest news today"
            }
        """

        app = self.__init_server()
        # Add chat route
        app.add_api_route("/chat", self.chat_route_handler, methods=["POST"])
        return app
    
    def run_server(self):

        PORT = int(os.environ.get("PORT", 8000))  # Default to 8000 if not set
        HOST = os.environ.get("HOST", 'localhost')  # Default to 'localhost' if not set

        app = self.__init_routes()
        uvicorn.run(app, host=HOST, port=PORT)

    def run(self):
        """Starts the chatbot interaction loop, processing user inputs and generating responses."""
        print("Jarvis: Hello! How can I assist you today?")
        
        while True:
            user_question = input("Ask a question: ")
            if user_question.lower() == "exit":
                print("Exiting the chatbot. Goodbye!")
                sys.exit(0)

            response = self.user_query(user_question)
            print("Jarvis:", response)

            # Store conversation in chat history
            self.chat_history.append(HumanMessage(user_question))
            self.chat_history.append(AIMessage(response))

if __name__ == "__main__":
    chatbot = Chatbot()
    chatbot.run_server()