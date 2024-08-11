from langchain_community.document_loaders import TextLoader, WebBaseLoader
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.llms.ollama import Ollama
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.retrieval import create_retrieval_chain
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import bs4
import sys
from dotenv import load_dotenv
import os
os.environ['USER_AGENT'] = 'myagent'

load_dotenv()

file_path = 'data/my_profile.txt'
loader = TextLoader(file_path)
text_loader = loader.load()

model = "llama3.1"
llm = Ollama(model=model)

template = """
system:
    Answer the following question based on the provided context.
    Give a summary or short answer and understandable response.

context:
{context}

user:
    Question: {input}

"""
prompt = ChatPromptTemplate.from_template(template)
output_parser = StrOutputParser()


web_path = 'https://en.wikipedia.org/wiki/Jos%C3%A9_Rizal'
web_loader = WebBaseLoader(web_path, bs_kwargs=dict(parse_only=bs4.SoupStrainer(
    class_=("vector-body", "ve-init-mw-desktopArticleTarget-targetContainer")
)))
web_text = web_loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
documents = text_splitter.split_documents(web_text)

db = FAISS.from_documents(documents[:5], OllamaEmbeddings(model=model))

document_chain = create_stuff_documents_chain(llm=llm, prompt=prompt, output_parser=output_parser)
retriever = db.as_retriever()

chain_retriever = create_retrieval_chain(retriever, document_chain)


while True:
    print(" ")
    input_text = input("Your question: ")
    print(" ")


    if input_text in ['q', 'exit', 'quit']:
        sys.exit(1)

    result = chain_retriever.invoke({"input": input_text})
    print(result['answer'])
