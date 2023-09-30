from langchain.agents import Tool
from langchain.memory import ConversationBufferMemory
from langchain.utilities import SerpAPIWrapper
from langchain.tools.render import render_text_description
from langchain.agents.output_parsers import ReActSingleInputOutputParser
from langchain.agents.format_scratchpad import format_log_to_str
from langchain import hub
from langchain.agents import AgentExecutor
from llms import HuggingFaceHubLLMS

# Initialize the LLM model
hugging = HuggingFaceHubLLMS()

# Setting Repo
hugging.set_repo('flan')


llm_model = hugging.llm

# Initialize the SERP API wrapper
search = SerpAPIWrapper()

# Define tools for the agent
tools = [
    Tool(
        name="Current Search",
        func=search.run,
        description="Useful for when you need to answer questions about current events or the current state of the world"
    ),
]

# Create a prompt for the agent
prompt = hub.pull("hwchase17/react-chat").partial(
    tools=render_text_description(tools),
    tool_names=", ".join([t.name for t in tools]),
)

# Define the agent pipeline
agent = {
    "input": lambda x: x["input"],
    "agent_scratchpad": lambda x: format_log_to_str(x['intermediate_steps']),
    "chat_history": lambda x: x["chat_history"]
} | prompt | llm_model.bind(stop=["\nObservation"]) | ReActSingleInputOutputParser()

# Initialize the memory
memory = ConversationBufferMemory(memory_key="chat_history")

# Initialize the agent executor
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True, memory=memory)

# Invoke the agent with an example input
output = agent_executor.invoke({"input": "hi, i am bob"})['output']
print(output)
