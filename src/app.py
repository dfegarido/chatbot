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
# from langchain_ollama import OllamaLLM, OllamaEmbeddings, ChatOllama
from datetime import datetime
from fastapi import FastAPI
from langserve import add_routes
import uvicorn

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
from pydantic import BaseModel, Field
from pydantic import BaseModel, Field



class multiply(BaseModel):
    """Multiply two integers."""

    a: int = Field(..., description="First integer")
    b: int = Field(..., description="Second integer")


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
        # self.llm = ChatOllama(model="llama3.1:latest", temperature=0.0)

        # self.bind_tool_llm = self.llm.bind_tools([
        #     news_tool
        # ])

        # self.rendered_tools = render_text_description(self.tools)
        
        self.system_prompt = self.create_system_prompt()
        self.prompt = self.create_chat_prompt()
        self.output_parser = StrOutputParser()
        self.conversation = self.prompt | self.llm | self.output_parser

        self.memory = Memory()  # Initialize memory
        self.chat_history = self.load_chat_history()  # Load existing chat history


    def create_system_prompt(self):
        """Creates the system prompt for the chatbot."""
        return f"""
            Your name is Jarvis, a friendly and helpful assistant designed to provide concise, clear,
            and direct answers to user inquiries.

            You can remember context and utilize chat history to deliver relevant and coherent responses.
            When users reference past conversations,
            acknowledge those references and build on them to create a seamless interaction.

            You have access to the following tools:
            {{tools}}

            You have access to chat history:
            {{chat_history}}

            Your primary goal is to ensure user satisfaction by being both informative and approachable.
            Engage with a conversational tone that includes appropriate humor and empathy,
            making each interaction enjoyable and engaging for the user.
        """

    def create_chat_prompt(self):
        """Constructs the chat prompt template using the system prompt and placeholders."""
        template = """
    
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
        messages = self.memory.get_messages()
        return [HumanMessage(content=msg[1]) if msg[0] == 'human' else AIMessage(content=msg[1]) for msg in messages]

    def get_response(self, user_input):
        """Generates a response to the user's input using the conversation chain."""
        # breakpoint()
        # tools = ''.join(t.name for t in self.tools)
        # tool_names = ''.join(t.name for t in self.tools)

        return self.conversation.invoke(
            {
                "human_input": user_input,
                "chat_history": self.chat_history[-10:],  # Use the last 10 messages
                # "chat_history": [],  # Use the last 10 messages
                # "tools": tools,
                # "tool_names": tool_names
            }
        )

    def user_query(self, user_question):
        """Trigger to start conversation."""
        response = self.get_response(user_question)

        # Append to chat history for future reference
        self.chat_history.append(HumanMessage(content=user_question))
        self.chat_history.append(AIMessage(content=response))

        # Save updated chat history to memory
        self.memory.add_message(user_question, response)

        return response

    def chat_route_handler(self, request):
        """Handles chat requests and generates responses."""
        user_input = request.get("user_input")

        # Generate a response using the conversation chain
        response = self.get_response(user_input)

        # Append to chat history for future reference
        self.chat_history.append(HumanMessage(content=user_input))
        self.chat_history.append(AIMessage(content=response))

        # Save updated chat history to memory
        self.memory.add_message(user_input, response)

        return {"response": response, "chat_history": self.chat_history}

    def run_streamlit_app(self):
        """Runs the Streamlit application for the chatbot."""
        st.title("Chatbot Assistant")

        user_input = st.text_input("Ask me anything:")
        start_time = datetime.now()
        if st.button("Send"):
            if user_input:
                response = self.user_query(user_input)

                # Display the response
                end_time = datetime.now()
                st.write(f"Process time {end_time - start_time}")
                st.write("**Jarvis:**", response)
            else:
                st.write("Please enter a question.")

    def run_server(self):
        app = FastAPI(
            title="Jarvis API Server",
            version='1.0',
            description='This is a jarvis server'
        )

        add_routes(
            app,
            self.conversation,
            path='/chat'
        )

        uvicorn.run(app, host='localhost', port=8000)

    def run(self):
        while True:
            user_input = input("Ask me anything: ")
            start_time = datetime.now()

            if user_input in ['exit']:
                sys.exit(1)
            
            response = self.bind_tool_llm.invoke([HumanMessage(user_input)])
            end_time = datetime.now()
            print(f" ")
            print(f"Processing time: {end_time - start_time}")
            print(response)
            
            print(f" ")
            # final_answer = response.split('Final Answer:')[-1]
            # print(f"Jarvis: {final_answer}")
            print(f" ")

if __name__ == "__main__":
    chatbot = Chatbot()
    
    chatbot.run_server()
