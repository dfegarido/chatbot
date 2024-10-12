"""
A generative AI chatbot assistant.
"""

import os
import sys
from datetime import datetime as dt

from langchain_core.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)
from langchain_core.messages import SystemMessage
from langchain_groq import ChatGroq
from langchain_core.tools import render_text_description
from langchain_core.output_parsers import StrOutputParser
from langchain_community.tools import DuckDuckGoSearchRun
from langchain.globals import set_debug

set_debug(False)

# Add src to Python Path to avoid errors in module import
if os.path.abspath("./tools/") not in sys.path:
    sys.path.insert(0, os.path.abspath("./tools/"))

from weather import WeatherTool
from news import news_tool
from date import date_tool

class Chatbot(WeatherTool):
    """A simple chatbot that uses generative AI to assist users with questions and tasks."""

    def __init__(self):
        """Initializes the Chatbot with necessary configurations and tools."""
        self.groq_api_key = os.environ["GROQ_API_KEY"]
        self.model = "llama3-8b-8192"
        self.groq_chat = ChatGroq(groq_api_key=self.groq_api_key, model_name=self.model)

        self.tools = self.__tools
        self.rendered_tools = render_text_description(self.tools)

        self.system_prompt = self.create_system_prompt()
        self.prompt = self.create_chat_prompt()
        self.output_parser = StrOutputParser()
        self.conversation = self.prompt | self.groq_chat | self.output_parser
        self.chat_history = self.initialize_chat_history()

    @property
    def __tools(self):
        return [
            self.weather_tool,
            news_tool,
            date_tool,
        ]

    def create_system_prompt(self):
        """Creates the system prompt for the chatbot."""
        return f"""
            Your name is Jarvis, you are a helpful assistant.
            You always give short and direct answers.
            You are an assistant that has access to the following set of tools. 
            Dont respond what tools that you are using
            Here are the names and descriptions for each tool:

            {self.rendered_tools}
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

    def initialize_chat_history(self):
        """Initializes the chat history with default entries."""
        return [
            {"role": "human", "content": "My name is Darwin"},
            {"role": "human", "content": "We're located at San Pedro Laguna"},
            {"role": "human", "content": f"Current date today {dt.today()}"},
        ]

    def get_response(self, user_input):
        """Generates a response to the user's input using the conversation chain."""
        return self.conversation.invoke(
            {"human_input": user_input, "chat_history": self.chat_history}
        )

    def run(self):
        """Starts the chatbot interaction loop, processing user inputs and generating responses."""

        user_question= "Greet me."
        response = self.get_response(user_question)
        print("Jarvis:", response)
        print(" ")

        while True:
            user_question = input("Ask a question: ")

            if user_question.lower() == "exit":
                sys.exit(0)

            response = self.get_response(user_question)
            print("Jarvis:", response)
            print(" ")

            self.chat_history.append({"role": "human", "content": user_question})

            if len(self.chat_history) > 5:
                del self.chat_history[:-5]


if __name__ == "__main__":
    chatbot = Chatbot()
    chatbot.run()
