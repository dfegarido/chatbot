from langchain_core.tools import tool
import os, sys

# Add src to Python Path to avoid errors in module import
sys.path.insert(0, os.path.abspath("./utils/"))
sys.path.insert(0, os.path.abspath("./tools/"))

from vectore_store import PineconeClient

@tool("history_tool", return_direct=True, response_format="content_and_artifact")
def history_tool(query_conversation: str) -> str:
    """
    Retrieves past conversation history based on a query.

    This tool allows the generative AI to access and summarize previous conversations
    that match the given query input. It queries the 'chat-history' index in Pinecone
    to find relevant entries.
    Use the return context and summarize to make it understandable and clear.

    Args:
        query_conversation (str): A string representing a keyword 
                                   to search for in the chat history.

    Returns:
        str: A summary of the relevant conversation history extracted from the index.
    """
    
    pc = PineconeClient('chat-history')

    # Query the index for relevant conversation history
    result = pc.query_index(query_conversation)

    return result

