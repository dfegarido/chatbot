import os
import sys
import datetime as dt
from dotenv import load_dotenv
import streamlit as st
from langchain_core.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)
from langchain.agents import create_react_agent, AgentExecutor
from langchain_core.messages import SystemMessage
from langchain_groq import ChatGroq
from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain.agents import Tool


load_dotenv()

# Add src to Python Path to avoid errors in module import
sys.path.insert(0, os.path.abspath("./utils/"))
sys.path.insert(0, os.path.abspath("./tools/"))

from weather import WeatherTool
from news import get_news

class ChatAssistant:
    def __init__(self):
        self.tools = [self.news_tool()]
        # self.model = ChatGroq(model_name="llama3-70b-8192", 
        #                       groq_api_key=os.environ.get("GROQ_API_KEY"), 
        #                       temperature=0.7)
        self.llm = OllamaLLM(model="llama3.1:latest")
        self.prompt = self.create_chat_prompt()
        self.conversata


    def news_tool(self):
        return Tool(
            name="Get News Today",
            func=get_news,
            description="""
                Fetch the latest news articles based on a search query.

                This tool allows you to search for articles on any topic from GMA News. 
                Simply provide a search query (e.g., “latest tech news”), and the tool will return 
                the most recent articles related to your query.
            """
        )


    def create_system_prompt(self):
        return """
            Your name is Jarvis, and you are a smart and funny assistant.
            You provide concise, clear, and direct answers to user queries while sprinkling in humor.
            You have the ability to remember previous conversations from chat history, allowing you to acknowledge user references and build on that context.
            Always prioritize user satisfaction and strive to be both informative and approachable. Speak with a human touch, making the conversation enjoyable and entertaining.
        """

    def create_chat_prompt(self):
        template = '''You are an assistant with access to the following tools:

                    {tools}

                    When answering a question, use the following structure:

                    1. Question: {input}
                    2. Thought: Briefly consider what action to take.
                    3. Action: Choose one of [{tool_names}].
                    4. Action Input: Provide the input needed for the chosen action.
                    5. Observation: Summarize the result of the action.
                    6. Final Answer: Provide a concise answer based on your observation (if applicable, without including another action).

                    Avoid unnecessary repetition and strive to provide the most relevant information directly.

                    Begin!
                    '''
        return ChatPromptTemplate.from_messages(
            [
                SystemMessage(content=self.create_system_prompt()),
                MessagesPlaceholder(variable_name="chat_history", optional=True),
                HumanMessagePromptTemplate.from_template(template),
            ]
        )

    def ask_question(self, query):
        response = self.react_agent_executor.invoke({'input': query})
        return response['output']


def main():
    st.title("Chat Assistant")
    assistant = ChatAssistant()

    query = st.text_input("Ask me anything:")
    if st.button("Submit"):
        if query:
            response = assistant.ask_question(query)
            st.write("Response:", response)
        else:
            st.write("Please enter a query.")


if __name__ == "__main__":
    main()
