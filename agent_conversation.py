from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.llms import GPT4All
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.utilities import SerpAPIWrapper
from langchain.agents import Tool, AgentType, initialize_agent, AgentExecutor, load_tools
from langchain.tools.render import render_text_description
from langchain.agents.output_parsers import ReActSingleInputOutputParser
from langchain.agents.format_scratchpad import format_log_to_str
from langchain import hub

import dotenv

dotenv.load_dotenv()

params = {
    "engine": "google"
}
search = SerpAPIWrapper()





model_name = ('./models/mistral-7b-openorca.Q4_0.gguf')
# model_name = './models/orca-mini-3b-gguf2-q4_0.gguf'

# Callbacks support token-wise streaming
callbacks = [StreamingStdOutCallbackHandler()]

# template = """You are a funny chatbot having a conversation with a human.

# {chat_history}
# Human: {human_input}
# AI:"""


# prompt = PromptTemplate(template=template, input_variables=["chat_history","human_input"])

memory = ConversationBufferMemory(memory_key="chat_history")

llm = GPT4All(model=model_name, 
              backend="gptj", 
              callbacks=callbacks, 
              temp=0.7,
              max_tokens=200)

tools = load_tools(["serpapi"], llm=llm)

prompt = hub.pull("hwchase17/react")
prompt = prompt.partial(
    tools=render_text_description(tools),
    tool_names=", ".join([t.name for t in tools]),
)
llm_with_stop = llm.bind(stop=["\nObservation"])

agent = {
    "input": lambda x: x["input"],
    "agent_scratchpad": lambda x: format_log_to_str(x['intermediate_steps']),
    "chat_history": lambda x: x["chat_history"]
} | prompt | llm_with_stop | ReActSingleInputOutputParser()



agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True, memory=memory)


while True:
    question = input(">> ")
    if question == 'exit':
            break
    if question == ' ' or len(question) == 0:
        continue
    try:
        
        res = agent_executor.invoke({"input":question})
        print(res['output'])
    except Exception as e:
        print(str(e))
    finally:
        continue



