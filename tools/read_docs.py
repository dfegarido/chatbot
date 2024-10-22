from langchain_core.tools import tool
import os
import sys
import logging

# Configure logging
# logging.basicConfig(level=logging.INFO)

# Add src to Python Path to avoid errors in module import
sys.path.insert(0, os.path.abspath("./utils/"))
sys.path.insert(0, os.path.abspath("./tools/"))

from vectore_store import PineconeClient

@tool("read_docs_tool", return_direct=True, response_format="content_and_artifact")
def read_docs_tool() -> None:
    """
    When trigger this will read the documents from folders
    """
    pc = PineconeClient(index_name='chat-history')

    insert_data = [{
            "role": "human",
            "context": "My name is Darwin Fegarido"
        }]
    pc.add_data(insert_data)


@tool("retrieve_data_tool", return_direct=True, response_format="content_and_artifact")
def retrieve_data_tool(query: str) -> str:
    """
    Will get the data from database
    Input:
        query: str
    
    Sample input:
        query: 'what is machine learning'
    """
    pc = PineconeClient(index_name='chat-history')

    result = pc.query_index(query)
    return result


if __name__ == "__main__":
    read_docs_tool()