from langchain_community.document_loaders import TextLoader, WebBaseLoader
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.llms.ollama import Ollama
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.retrieval import create_retrieval_chain
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_community.document_loaders import PyPDFDirectoryLoader, DirectoryLoader, TextLoader
import bs4
import sys
from dotenv import load_dotenv
import time
import os
import streamlit as st
from langchain_groq import ChatGroq

load_dotenv()

st.title("Chat Groq with Llama3")

groq_api_key = os.getenv("GROQ_API_KEY")

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

text_input = st.text_input("Ask any question base from your documents")


def vector_embedding():
    """Vector Embedding"""

    if "vectors" not in st.session_state:
        st.session_state.embeddings = OllamaEmbeddings(model='llama3.1')
        st.session_state.loader = DirectoryLoader('./', glob="data/*.txt", loader_cls=TextLoader, use_multithreading=True)
        st.session_state.docs = st.session_state.loader.load()
        st.session_state.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        st.session_state.final_documents = st.session_state.text_splitter.split_documents(st.session_state.docs)
        st.session_state.vectors = FAISS.from_documents(st.session_state.final_documents, st.session_state.embeddings)



if st.button("Upload Document"):
    vector_embedding()
    st.write("Vector DB Store ready")


if text_input:
    document_chain = create_stuff_documents_chain(llm, prompt)
    retriever = st.session_state.vectors.as_retriever()
    chain = create_retrieval_chain(retriever, document_chain)

    start = time.process_time()
    response = chain.invoke({'input': text_input})
    print(f"Response time {time.process_time() - start}")
    st.write(response["answer"])

    with st.expander("Document similarity search"):
        for i, doc in enumerate(response['context']):
            st.write(doc.page_content)
            st.write('----------------------------------')
    

