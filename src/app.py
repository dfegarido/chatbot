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

set_debug(False)

# Add src to Python Path to avoid errors in module import
sys.path.insert(0, os.path.abspath("./utils/"))
sys.path.insert(0, os.path.abspath("./tools/"))

from memory import Memory
from vectore_store import PineconeClient
from weather import WeatherTool
from news import news_tool
from date import date_tool
from history import history_tool

class Chatbot(WeatherTool):
    """A simple chatbot that uses generative AI to assist users with questions and tasks."""

    def __init__(self):
        """Initializes the Chatbot with necessary configurations and tools."""
        self.groq_api_key = os.environ["GROQ_API_KEY"]
        self.model = "llama3-8b-8192"
        self.llm = ChatGroq(groq_api_key=self.groq_api_key, model_name=self.model)

        self.tools = self.__tools
        self.rendered_tools = render_text_description(self.tools)

        self.system_prompt = self.create_system_prompt()
        self.prompt = self.create_chat_prompt()
        self.output_parser = StrOutputParser()
        self.conversation = self.prompt | self.llm | self.output_parser
        self.memory = Memory()
        self.pc = PineconeClient(index_name='chat-history')
        self.chat_history = []



    @property
    def __tools(self):
        return [
            history_tool,
            self.weather_tool,
            news_tool,
            date_tool,
            
        ]

    def create_system_prompt(self):
        """Creates the system prompt for the chatbot."""

        return f"""
            Your name is Jarvis, and you are a helpful assistant.
            You always give short and direct answers.
            Before using any tools, you will first review the chat-history or history_tool for context.
            You are an assistant that has access to the following set of tools. 
            Do not mention what tools you are using.
            
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

    def get_response(self, user_input):
        """Generates a response to the user's input using the conversation chain."""
        return self.conversation.invoke(
            {"human_input": user_input, "chat_history": self.chat_history[-10:]}
        )

    def user_query(self, user_question):
        """ trigger to start conversation """
        # chat_history = self.pc.query_index(user_question, top_k=5)
        # print(chat_history)
        print(" ")
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

    def run(self):
        """Starts the chatbot interaction loop, processing user inputs and generating responses."""
        user_question= "Greet me."
        response = self.user_query(user_question)
        print("Jarvis:", response)
        print(" ")

        while True:

            user_question = input("Ask a question: ")
            if user_question.lower() == "exit":
                sys.exit(0)


            response = self.user_query(user_question)
            print("Jarvis:", response)
            print(" ")

            user_message = user_question
            ai_message = response

            # For short term memory
            self.chat_history.append(HumanMessage(user_message))
            self.chat_history.append(AIMessage(ai_message))


            # Doing this to store relevant conversation
            # Should improve this in the future
            # This is for long term memory
            if len(ai_message.split(' ')) > 20:
                data_message = data_message = {
                        "context": AIMessage(ai_message),
                        "metadata": {
                            "timestamp": str(dt.datetime.now()),
                            "user_id": 'human',
                            "topic": self.extract_topic(ai_message)
                        }
                    }
                self.pc.add_data(data_message)

            # self.memory.add_message(user_message, ai_message)



            

            
if __name__ == "__main__":
    chatbot = Chatbot()
    chatbot.run()
