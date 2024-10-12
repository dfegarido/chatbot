import urllib.parse
from langchain_community.document_loaders import WebBaseLoader
from langchain_core.tools import tool

@tool("news_tool", return_direct=True, response_format="content_and_artifact")
def news_tool(query: str) -> str:
    """
    News Search Tool

    👋 Hey there! Want to stay updated on the latest news? With this tool, you can easily search for articles on any topic!

    How It Works:
    Just provide a search query, like “latest tech news” or “coronavirus updates,” and I'll fetch the most recent articles from Google News for you.

    What You'll Get:
    - Article Title: What's the headline?
    - Summary: A quick overview of the article.
    - URL: A link to read more.
    - Source: Where the article is published.

    Example:
    For instance, if you search for “latest tech news,” I might tell you: "In the latest tech news, Apple has just unveiled the new iPhone 13! According to CNN, it comes with an upgraded camera system and better battery life. If you want to check it out, you can read more here. Exciting stuff!"
    """
    
    # Encode the search query to ensure it's URL-safe
    encoded_query = urllib.parse.quote(query)
    
    # Create a loader for Google News search results
    news_url = f"https://news.google.com/search?q={encoded_query}&hl=en-PH&gl=PH&ceid=PH%3Aen"
    loader = WebBaseLoader([news_url])
    
    # Load the documents from the specified URL
    docs = loader.load()
    
    # Return the first document retrieved
    return docs[0] if docs else "No articles found."
