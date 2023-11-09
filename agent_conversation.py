import os
from langchain.memory import ConversationBufferMemory, SQLChatMessageHistory
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.llms import GPT4All
from langchain.agents import  AgentType, initialize_agent, load_tools
import dotenv

dotenv.load_dotenv()


model_name = ('./models/mistral-7b-openorca.Q4_0.gguf')

verbose = eval(os.getenv('VERBOSE', True))

# Callbacks support token-wise streaming
callbacks = [StreamingStdOutCallbackHandler()]

llm = GPT4All(model=model_name, 
              callbacks=callbacks,
              temp=0.7, 
              top_k=40, 
              top_p=0.4, 
              repeat_penalty=1.18, 
              repeat_last_n=64, 
              n_batch=8, 
              n_predict=None,
              max_tokens=2048,
              verbose=True,
              streaming=True,
              n_threads=20
              )

tool_names = ["serpapi", 'llm-math', 'wikipedia']
tools = load_tools(tool_names, llm=llm)

# Slightly tweak the instructions from the default agent
format_instructions = """
Use the following format:

Chat History:
[Here, you can record the entire conversation history, including user inputs and AI responses, to maintain context.]

User: [User's current input]
AI: [AI's previous response]

Question: [Share your thoughts.]

Thought: [Take a moment to consider the best way to help you.]

Action: [Decide on the most suitable action to take, use base knowledge or use tools if needed]

Action Input: [What to instruct the AI Action representative]

Observation: [Here's what I found or what I can do for you. User can't see any of my observations, API responses, links, or tools.]

... (this Thought/Action/Action Input/Observation can repeat N times)

Thought: [I now know the final answer. User can't see any of my observations, API responses, links, or tools. Always limit its token to minimize the context window.]

Final Answer: [The final answer to the original input question with the right amount of detail]

When responding with your Final Answer, remember that the person you are responding to CANNOT see any of your Thought/Action/Action Input/Observations, so if there is any relevant information there you need to include it explicitly in your response.
"""

def handle_error(e):
    # Handle the parsing error gracefully, you can add more specific logic if needed
    [*_, response] = str(e).split('AI: ')
    # if "\n" in response:
    #     [*_, response] = response.split('\n')
    # breakpoint()
    return response

session_id = "my-session"
connection_string = "sqlite:///sqlite.db"

chat_memory = SQLChatMessageHistory(session_id=session_id, connection_string=connection_string)

memory = ConversationBufferMemory(memory_key="chat_history", chat_memory=chat_memory, return_messages=True)

prefix = """Have a conversation with a human, 
            answering the following questions as best you can. 
            You have access to the following tools:"""
suffix = """Begin!"

{chat_history}
Question: {input}
{agent_scratchpad}"""


agent_kwargs = {
    "format_instructions": format_instructions,
    "prefix": prefix,
    "suffix": suffix,
    "input_variables": ["input", "chat_history", "agent_scratchpad"]
}

agent_chain = initialize_agent(tools=tools, 
                                llm=llm, 
                                agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, 
                                verbose=verbose, 
                                early_stopping_method='generate', 
                                max_iterations=2,
                                memory=memory, 
                                agent_kwargs=agent_kwargs,
                                handle_parsing_errors=handle_error,
                            )


questions = [
    'who is michael jackson',
    # 'what name of his jordans wife',
    # 'whats the birthday of jordans wife'
]



# Interaction loop
for question in [*questions, 'exit']:

    print(' ')
    print('Question: ', question)
    # User input
    # question = input("You: ")
    # Exit condition
    if question.lower() == 'exit':
        break
    
    # Skip empty inputs
    if question.strip() == '':
        continue
    
    try:
        # Get response from the agent
        response = agent_chain.run(input=question)
        print('Question: ', question)

        # Print AI response
        print('AI response: ', response)
        
    except Exception as e:
        # Handle parsing errors
        print(f"err: {str(e)}")
    finally:
        continue




