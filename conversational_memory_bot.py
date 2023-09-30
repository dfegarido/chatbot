import os
from langchain.llms import HuggingFaceHub
from langchain.chains import ConversationChain  
from langchain.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain.memory import ConversationBufferMemory, ConversationBufferWindowMemory, ConversationSummaryMemory
from llms import HuggingFaceHubLLMS

hug_llms = HuggingFaceHubLLMS()

# Setting repo
hug_llms.set_repo('flan')

llm = hug_llms.llm


# Prompt 
prompt = ChatPromptTemplate(
    messages=[
        SystemMessagePromptTemplate.from_template(
            "You are a nice chatbot having a conversation with a human."
        ),
        # The `variable_name` here is what must align with memory
        MessagesPlaceholder(variable_name="chat_history"),
        HumanMessagePromptTemplate.from_template("{input}")
    ]
)



# Notice that we `return_messages=True` to fit into the MessagesPlaceholder
# Notice that `"chat_history"` aligns with the MessagesPlaceholder name
memory = ConversationBufferMemory(llm=llm, memory_key="chat_history", return_messages=True, ai_prefix='', human_prefix='')
memory.save_context({"input": "hi"},{"output": "whats up"})

print(memory.load_memory_variables({}))

conversation = ConversationChain(
    llm=llm,
    prompt=prompt,
    verbose=False,
    memory=memory
)


while True:
    query = input('>> : ')

    if(query == 'exit'):
        break

    response = conversation.predict(input=query)

    print("================")
    print(response)
    print(("================"))




