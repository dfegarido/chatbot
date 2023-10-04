import langchain
# We can do the same thing with a SQLite cache
from langchain.cache import SQLiteCache
from llms.hugging_facehub import HuggingFaceHubLLMS
from langchain.prompts import PromptTemplate, ChatPromptTemplate, HumanMessagePromptTemplate
from langchain.chains import LLMChain
from langchain.output_parsers import StructuredOutputParser, ResponseSchema


langchain.llm_cache = SQLiteCache(database_path=".langchain.db")


# To make the caching really obvious, lets use a slower model.
llm = HuggingFaceHubLLMS().llm


template = """
            answer the users question as best as possible.\n{format_instructions}\n{question}
            """

response_schemas = [
    ResponseSchema(name="answer", description="answer to the user's question"),
    ResponseSchema(name="source", description="source used to answer the user's question, should be a website.")
]
output_parser = StructuredOutputParser.from_response_schemas(response_schemas)

format_instructions = output_parser.get_format_instructions()
prompt = PromptTemplate(
    messages=[
        HumanMessagePromptTemplate.from_template("answer the users question as best as possible.\n{format_instructions}\n{question}")  
    ],
    input_variables=["question"],
    partial_variables={"format_instructions": format_instructions}
)

llm_chain = LLMChain(prompt=prompt, llm=llm)




question = ''
while True:
    question = input('>> : ')
    if question == 'exit':
        break

    _input = prompt.format_prompt(question=question)
    output = llm(_input.to_string())

    # The first time, it is not yet in cache, so it should take longer
    # x = output_parser.parse(output)
    print(output)