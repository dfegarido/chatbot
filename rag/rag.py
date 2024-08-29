from langchain_community.document_loaders import TextLoader, WebBaseLoader, DirectoryLoader
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.llms.ollama import Ollama
from langchain_community.chat_models import ChatOllama
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.retrieval import create_retrieval_chain
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
from langchain_community.tools import DuckDuckGoSearchRun
from langchain.tools.retriever import create_retriever_tool
from langchain.agents import create_openai_tools_agent, AgentExecutor
from langchain import hub
from openai_agent_template import CustomPromptTemplate
from weather_tool import CustomWeatherTool
import bs4
import sys
from dotenv import load_dotenv
import os
from langchain_groq import ChatGroq
from langchain_community.document_loaders import JSONLoader
import json
from langchain_core.documents.base import Document
from groq import BadRequestError

load_dotenv()

api_wrapper = WikipediaAPIWrapper(top_k_results=1, doc_content_char_max=200)
loader = DirectoryLoader('./', glob='data/*.txt', loader_cls=TextLoader)

groq_api_key = os.getenv("GROQ_API_KEY")

llm = ChatGroq(groq_api_key=groq_api_key, model_name="llama3-8b-8192")

model = "llama3.1"
# model = "gemma"
# llm = ChatOllama(model=model)


# prompt = hub.pull("hwchase17/openai-tools-agent")
prompt = CustomPromptTemplate().chat_template



text_loader = loader.load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
documents = text_splitter.split_documents(text_loader)
vector = FAISS.from_documents(documents, OllamaEmbeddings(model=model))
retriever = vector.as_retriever()

file_tool = create_retriever_tool(
    retriever, 
    name='data_files', 
    description="A tool designed to retrieve and manage information related to Darwin Fegarido. This includes personal profiles, professional history, skill sets, project experiences, and other relevant documents. Ideal for querying and extracting specific data points or comprehensive details about Darwin Fegarido from stored files."
)


weather_result = CustomWeatherTool().result()
# Creating the Document instance
weather_loader = Document(
    metadata={"source": "https://open-meteo.com/"},
    page_content=str(weather_result)
)

documents = text_splitter.split_documents([weather_loader])
vector = FAISS.from_documents(documents, OllamaEmbeddings(model=model))
retriever = vector.as_retriever()

weather_tool = create_retriever_tool(retriever, name='weather_tool', description="A tool that retrieves and provides accurate and up-to-date weather information. ")


wiki_tool = WikipediaQueryRun(api_wrapper=api_wrapper)
search_tool = DuckDuckGoSearchRun()


tools = [
    search_tool,
    file_tool,
    weather_tool,
    wiki_tool,

]

# Updated template to include message history
# template = [
#     ("system", "You are a friendly and helpful assistant. If you are unsure about an answer, you should use the available tools to search for the correct information before responding."),
#     ("system", "Here is the history of the conversation: {chat_history}"),
#     ("human", "Here’s what I’d like to talk about: {input}"),
#     ("system", "First, gather relevant context and details related to the input. Use the available tools to collect this information."),
#     ("system", "Analyze the gathered context and any additional information obtained to understand the underlying needs or questions."),
#     ("system", "Make it understandable and short answer"),
#     ("ai", "{agent_scratchpad}"),
# ]

# prompt = ChatPromptTemplate(template)

agent = create_openai_tools_agent(llm=llm, tools=tools, prompt=prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

chat_history = []

while True:

        print("======================================================")
        txt = input('Ask a question: ')
        if txt in ['q', 'exit']:
            sys.exit(1)
        
        try:
            # Add user input to message history
            chat_history.append(f"Human: {txt}")

            # Invoke the agent with the context, question, and message history
            response = agent_executor.invoke({
                "input": txt,
                "chat_history": chat_history,
                "tools": tools
            })
            
            # Add agent response to message history
            agent_response = response['output']
            chat_history.append(f"human: {txt}, assistant: {agent_response}")

            print("======================================================")
            print(f"Answer: {agent_response}")
            # print(response)
        except BadRequestError:
            print('bad request')

