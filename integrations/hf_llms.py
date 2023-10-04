from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import sys

sys.path.append('./')
from llms.hugging_facehub import HuggingFaceHubLLMS

llm = HuggingFaceHubLLMS().llm


template = """Question: {question}
Answer: Let's think step by step."""

prompt = PromptTemplate(template=template, input_variables=["question"])
llm_chain = LLMChain(prompt=prompt, llm=llm)

question = ''

while True:
    question = input(">> : ")
    if question == 'exit':
        break

    print(llm_chain.run(question))