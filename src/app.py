"""
Hugging Face with Langchain integration
Chatbot open source
Ref: https://www.youtube.com/watch?v=5CJA1Hbutqc&list=PLZoTAELRMXVOQPRG7VAuHL--y97opD5GQ&index=3
"""

from langchain_community.llms import Ollama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

import streamlit as st
import os
from dotenv import load_dotenv

load_dotenv()


template = """
System: You are a helpful assistant. Please response to the user queries on Filipino language
User: Question: {question}
"""

prompt = ChatPromptTemplate.from_template(template=template)



st.title("Langchain Demo API")
input_text = st.text_input("Enter your question")

llm = Ollama(model='llama3.1')
output_parser = StrOutputParser()
chain = prompt|llm|output_parser

if input_text:
    st.write(chain.invoke({"question": {input_text}}))