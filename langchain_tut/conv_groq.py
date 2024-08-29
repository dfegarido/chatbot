import os
import sys
from datetime import datetime as dt
from langchain_core.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)
from langchain_core.messages import SystemMessage
from langchain.chains.conversation.memory import ConversationBufferWindowMemory
from langchain_groq import ChatGroq
from langchain_core.tools import tool, render_text_description
from langchain_core.output_parsers import StrOutputParser
from langchain_community.tools import DuckDuckGoSearchRun
from langchain.globals import set_debug
from langchain_community.document_loaders import WebBaseLoader
import urllib.parse




set_debug(False)


# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = str(os.getenv("LANGCHAIN_API_KEY"))
# os.environ["LANGCHAIN_PROJECT"] = "pr-bumpy-succotash-85"
# os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"

# Add src to Python Path to avoid errors in module import
if os.path.abspath("./src/") not in sys.path:
    sys.path.insert(0, os.path.abspath("./src/"))
    sys.path.insert(0, os.path.abspath("./rag/"))

from weather_tool import CustomWeatherTool

@tool("link_tool", return_direct=True, response_format="content_and_artifact")
def link_tool(url: str) -> str:
    """
    Web Content Fetch Tool

    Retrieve the content of any webpage with this tool!
    Description: This tool allows you to fetch the content of a webpage by providing its URL. It loads the content of the webpage and returns the main text content to you. Ideal for tasks like web scraping or analyzing webpage data.
    
    Input: A URL (e.g., "https://example.com", "https://news.ycombinator.com/", etc.)
    
    Output: The main content of the webpage, typically including:
    
    - Page Title
    - Body Text
    - Any other primary content available on the page
    
    Example Output:
    
    "Webpage Content
    
    Title: "Example Domain"
    Body: "This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission..."
    
    Note: The exact output may vary depending on the structure of the webpage and its content.
    """
    loader_multiple_pages = WebBaseLoader([url])
    docs = loader_multiple_pages.load()
    return docs[0]


@tool("news_tool", return_direct=True, response_format="content_and_artifact")
def news_tool(query: str) -> str:
    """
    News Search Tool

    Get the latest news articles on any topic with this tool!
    Description: This tool allows you to search for news articles on any topic by querying Google News. Simply provide a search query, and this tool will fetch the latest news articles from Google News and return them to you.
    Input: A search query (e.g. "latest tech news", "coronavirus updates", etc.)
    Output: A list of news articles related to your search query, including:

    Article title
    Article summary
    Article URL
    Source publication
    Example Output:

    "Latest Tech News

    Article 1: "Apple Unveils New iPhone 13" (Source: CNN)
    Summary: Apple has announced the latest iPhone 13, featuring a new camera system and improved battery life.
    URL: https://www.cnn.com/2022/09/14/tech/apple-iphone-13/index.html

    Note: The output format may vary depending on the structure of the Google News results.
    """
    encoded_string = urllib.parse.quote(query)
    loader_multiple_pages = WebBaseLoader([f"https://news.google.com/search?q={encoded_string}&hl=en-PH&gl=PH&ceid=PH%3Aen"])
    docs = loader_multiple_pages.load()
    return docs[0]

@tool("multiply_tool", return_direct=True, response_format="content_and_artifact")
def multiply(a: int, b: int) -> int:
    """Multiply two integers.

    Args:
        a: First integer
        b: Second integer
    """
    return a * b


@tool("add_tool", return_direct=True, response_format="content_and_artifact")
def add(a: int, b: int) -> int:
    """Add two integers.

    Args:
        a: First integer
        b: Second integer
    """
    return a + b

@tool("weather_tool", return_direct=True, response_format="content_and_artifact")
def weather() -> str:
    """
    Weather Forecast Tool

    Get the latest weather forecast for your location with this tool!

    Description: This tool provides a concise and accurate weather forecast, including current conditions, temperature, humidity, wind speed, and more. Whether you're planning a trip, checking the weather for your daily commute, or just curious about the current conditions, this tool has got you covered.

    Input: None required! This tool will automatically detect your location and provide the current weather forecast.

    Output: A detailed weather forecast, including:

    Current temperature and conditions
    High and low temperatures for the day
    Humidity and wind speed
    Chance of precipitation
    Weather forecast for the next few days
    Example Output:

    "Current Weather:
    Temperature: 75°F (24°C)
    Conditions: Partly Cloudy
    Humidity: 60%
    Wind Speed: 10 mph

    Forecast:
    Today: High of 80°F (27°C), Low of 65°F (18°C)
    Tomorrow: High of 85°F (29°C), Low of 70°F (21°C)"

    Usage: Simply call the weather_tool function to get the latest weather forecast for your location. No input required!
    """
    CW = CustomWeatherTool()
    return CW.result()

search_tool = DuckDuckGoSearchRun()


def main():
    """
    This function is the main entry point of the application. It sets up the Groq client, the Streamlit interface, and handles the chat interaction.
    """

    # Get Groq API key
    groq_api_key = os.environ["GROQ_API_KEY"]
    model = "llama3-8b-8192"

    # Initialize Groq Langchain chat object and conversation
    groq_chat = ChatGroq(groq_api_key=groq_api_key, model_name=model)

    tools = [add, multiply, weather, search_tool, news_tool, link_tool]
    rendered_tools = render_text_description(tools)

    print(" ")

    system_prompt = f"""
        Your name is Jarvis, you are a helpful assistant.
        You always give short and direct answers.
        You are an assistant that has access to the following set of tools. 
        Here are the names and descriptions for each tool:

        {rendered_tools}
        
        """

    # Construct a chat prompt template using various components
    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessage(
                content=system_prompt
            ),  # This is the persistent system prompt that is always included at the start of the chat.
            MessagesPlaceholder(
                variable_name="chat_history",
                optional=True
            ),  # This placeholder will be replaced by the actual chat history during the conversation. It helps in maintaining context.
            HumanMessagePromptTemplate.from_template(
                "{human_input}"
            ),  # This template is where the user's current input will be injected into the prompt.
        ]
    )
    output_parser = StrOutputParser()
    # Create a conversation chain using the LangChain LLM (Language Learning Model)
    conversation = prompt | groq_chat | output_parser
    chat_history = [
        {'role': 'human', 'content': "My name is Darwin"},
        {'role': 'human', 'content': "I lived in San pedro laguna"},
        {'role': 'human', 'content': f"Current date today {dt.today()}"},
    ]

    # The chatbot's answer is generated by sending the full prompt to the Groq API.
    response = conversation.invoke({
        "human_input": "Greet me, my name is Darwin",
        "chat_history": chat_history
    })
    print("Jarvis:", response)
    print(" ")

    while True:
        user_question = input("Ask a question: ")

        if user_question == 'exit':
            sys.exit(0)

        # The chatbot's answer is generated by sending the full prompt to the Groq API.
        response = conversation.invoke({
            "human_input": user_question,
            "chat_history": chat_history
        })
        print("Jarvis:", response)
        print(" ")

        chat_history.append(
            {'role': 'human', 'content': user_question},
        )

        if len(chat_history) > 5:
            del chat_history[:-5]

if __name__ == "__main__":
    main()
