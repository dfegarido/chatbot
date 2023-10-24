from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.llms import GPT4All, HuggingFaceHub, HuggingFacePipeline
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.utilities import SerpAPIWrapper
from langchain.agents import Tool, AgentType, initialize_agent, AgentExecutor, load_tools
from langchain.tools.render import render_text_description
from langchain.agents.output_parsers import ReActSingleInputOutputParser
from langchain.agents.format_scratchpad import format_log_to_str
from langchain.prompts import MessagesPlaceholder


import dotenv

dotenv.load_dotenv()




model_name = ('./models/mistral-7b-openorca.Q4_0.gguf')
# model_name = './models/orca-mini-3b-gguf2-q4_0.gguf'

# Callbacks support token-wise streaming
callbacks = [StreamingStdOutCallbackHandler()]



llm = GPT4All(model=model_name, 
              backend="gptj", 
              callbacks=callbacks, 
              temp=0.7,
              max_tokens=2048)

tool_names = ["serpapi", 'llm-math', 'wikipedia']
tools = load_tools(tool_names, llm=llm)

# Slightly tweak the instructions from the default agent
format_instructions = """Use the following format:

Chat History:
[Here, you can record the entire conversation history, including user inputs and AI responses, to maintain context.]

User: [User's previous input]
AI: [AI's previous response]

Question: [Ask your next question or share your thoughts.]

Thought: [Take a moment to consider the best way to help you.]

Action: [Decide on the most suitable action to take, should be one of [{tool_names}]]

Action Input: [What to instruct the AI Action representative]

Observation: [Here's what I found or what I can do for you.]

... (this Thought/Action/Action Input/Observation can repeat N times)

Thought: [I now know the final answer. User can't see any of my observations, API responses, links, or tools.]

Final Answer: [The final answer to the original input question with the right amount of detail]

When responding with your Final Answer, remember that the person you are responding to CANNOT see any of your Thought/Action/Action Input/Observations, so if there is any relevant information there you need to include it explicitly in your response."""


agent_kwargs = {
    "extra_prompt_messages": ["{memory}"], 
    "format_instructions": format_instructions
}

memory = ConversationBufferMemory(memory_key="chat_history")
agent = initialize_agent(tools=tools, 
                         llm=llm, 
                         agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION, 
                         verbose=False, 
                         early_stopping_method='generate', 
                         max_iterations=5,
                         memory=memory, 
                         agent_kwargs=agent_kwargs
                        )


while True:
    question = input(">> ")
    if question == 'exit':
            break
    if question == ' ' or len(question) == 0:
        continue
    try:
        agent.run(question)
        print("\n")
        print(memory.json())
        print(' ')
    except Exception as e:
        print(str(e))
    finally:
        continue



