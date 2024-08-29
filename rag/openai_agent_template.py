from typing import List, Union
from langchain_core.messages import (
    AIMessage, HumanMessage, ChatMessage, SystemMessage, FunctionMessage, ToolMessage
)
from langchain_core.prompts import PromptTemplate
from langchain.prompts import ChatPromptTemplate
from langchain_core.prompts import SystemMessagePromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder





class CustomPromptTemplate:

    def __init__(self):
        super().__init__()


        self.chat_template = ChatPromptTemplate(
                input_variables=['agent_scratchpad', 'input'],
                optional_variables=['chat_history'],
                input_types={
                    'chat_history': List[Union[AIMessage, HumanMessage, ChatMessage, SystemMessage, FunctionMessage, ToolMessage]],
                    'agent_scratchpad': List[Union[AIMessage, HumanMessage, ChatMessage, SystemMessage, FunctionMessage, ToolMessage]]
                },
                partial_variables={'chat_history': []},
                messages=[
                    SystemMessagePromptTemplate(
                        prompt=PromptTemplate(
                            input_variables=[], 
                            template=(
                                "You are a friendly and helpful assistant. "
                                "If you don't know the answer to a question, always use a search_tool to find it. "
                                "Review the search results carefully and consider using other {tools} to ensure accuracy. "
                                "Follow a five-step process {tools} before providing your response."
                            )
                        )
                    ),
                    MessagesPlaceholder(variable_name='chat_history'),
                    HumanMessagePromptTemplate(
                        prompt=PromptTemplate(
                            input_variables=['input'], 
                            template="Here’s what I’d like to talk about: {input}"
                        )
                    ),
                    MessagesPlaceholder(variable_name='agent_scratchpad'),
                    SystemMessagePromptTemplate(
                        prompt=PromptTemplate(
                            input_variables=[], 
                            template="Your answer should be clear, concise, and understandable."
                        )
                    ),
                ]
            )
