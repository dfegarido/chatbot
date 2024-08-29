from langchain_community.document_loaders import TextLoader, WebBaseLoader
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.llms.ollama import Ollama
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.retrieval import create_retrieval_chain
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_community.document_loaders import (
    PyPDFDirectoryLoader,
    DirectoryLoader,
    TextLoader,
)
import bs4
import sys
from dotenv import load_dotenv
import time
import os
import streamlit as st
from langchain_groq import ChatGroq

load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = str(os.getenv("LANGCHAIN_API_KEY"))
os.environ["LANGCHAIN_PROJECT"] = "pr-bumpy-succotash-85"
os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"

llm = ChatGroq(groq_api_key=groq_api_key, model_name="llama3-70b-8192")
# llm = Ollama(model='llama3.1')

template = """
system:
    Answer the following question based on the provided context.
    Give a summary answer with clear and understandable response.

context:
{context}

user:
    Question: {input}
"""

prompt = ChatPromptTemplate.from_template(template=template)


embeddings = OllamaEmbeddings(model="llama3.1")
docs_loader = DirectoryLoader("./", glob="data/*.txt", loader_cls=TextLoader, use_multithreading=True)
docs = docs_loader.load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
final_documents = text_splitter.split_documents(docs)
vectors = FAISS.from_documents(final_documents, embeddings)

document_chain = create_stuff_documents_chain(llm, prompt)
retriever = vectors.as_retriever()
chain = create_retrieval_chain(retriever, document_chain)


while True:
    start = time.process_time()
    print(" ")
    text_input = input("question : ")
    if text_input in ['q', 'exit']:
        sys.exit(0)

    response = chain.invoke({"input": text_input})
    print(response["answer"])

    print(f"Response time {time.process_time() - start}")
    print(" ")
