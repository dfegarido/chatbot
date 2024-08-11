from fastapi import FastAPI
from langchain.prompts import ChatPromptTemplate
from langchain_community.llms.ollama import Ollama
from langserve import add_routes
import uvicorn
from langchain_core.output_parsers import StrOutputParser

from dotenv import load_dotenv

load_dotenv()


app = FastAPI(
    title="Langchain server",
    version='1.0',
    description='This is a langchain server'
)



template = """
    system: You are GPT-5 a Large Language model created by openAI ,
    you are the best at answering any question and makes explanations very simple ,
    on point and accurate ,
    you are very helpful too and gives the perfect answers to all instructions and questions ,
    user: Question: {question}    
"""

llm = Ollama(model='llama3.1')
prompt = ChatPromptTemplate.from_template(template)
output_parser = StrOutputParser()

add_routes(
    app,
    prompt|llm|output_parser,
    path='/ollama'
)

if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=8000)