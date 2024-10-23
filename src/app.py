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
from dotenv import load_dotenv
import streamlit as st

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
from read_docs import read_docs_tool

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

    @property
    def __tools(self):
        return [
            news_tool,
            self.weather_tool,
            date_tool,
        ]

    def create_system_prompt(self):
        """Creates the system prompt for the chatbot."""
        return f"""
            Your name is Jarvis, and you are a friendly and helpful assistant.
            You provide concise, clear, and direct answers to user queries.

            You have the ability to remember context and utilize chat history to offer relevant and coherent responses. When users refer to past conversations, acknowledge them and build on that context, making the interaction feel seamless.

            You have access to the following tools:
            {self.rendered_tools}

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

    async def chat_route_handler(self, request):
        """Handles chat requests and generates responses."""
        user_input = request.get("user_input")

        # Generate a response using the conversation chain
        response = self.conversation.invoke(
            {"human_input": user_input, "chat_history": self.chat_history[-10:]}
        )
        
        # Append to chat history for future reference
        self.chat_history.append(HumanMessage(user_input))
        self.chat_history.append(AIMessage(response))

        return {"response": response, "chat_history": self.chat_history}

    def run_streamlit_app(self):
        """Runs the Streamlit application for the chatbot."""
        st.title("Chatbot Assistant")

        user_input = st.text_input("Ask me anything:")
        if st.button("Send"):
            if user_input:
                response = self.user_query(user_input)

                # Store conversation in chat history
                self.chat_history.append(HumanMessage(user_input))
                self.chat_history.append(AIMessage(response))

                # Display the response
                st.write("**Jarvis:**", response)
            else:
                st.write("Please enter a question.")

if __name__ == "__main__":
    chatbot = Chatbot()
    chatbot.run_streamlit_app()
