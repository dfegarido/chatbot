import urllib.parse
from langchain_community.document_loaders import WebBaseLoader
from langchain_core.tools import tool
from bs4 import BeautifulSoup
from requests_html import HTMLSession

@tool("news_tool", return_direct=True, response_format="content_and_artifact")
def news_tool(query: str) -> str:
    """
    Fetch the latest news articles based on a search query.

    This tool allows you to search for articles on any topic from GMA News. 
    Simply provide a search query (e.g., “latest tech news”), and the tool will return 
    the most recent articles related to your query.

    Example:
    Searching for “latest tech news” might return: 
    "Apple has unveiled the new iPhone 13! According to CNN, it features 
    an upgraded camera and better battery life. Read more here!"

    Args:
        query (str): The topic you want to search for.

    Returns:
        str: The content of the first relevant article found.
    """

    # Prepare the user-agent header to mimic a browser request
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    # Construct the search query
    query = f"Latest news {query}"
    encoded_query = urllib.parse.quote(query)
    
    # Define the base URL for GMA News
    gma_network = "https://www.gmanetwork.com/news"
    # Construct the search URL
    news_url = f"{gma_network}/search/?search_it#gsc.tab=0&gsc.q={encoded_query}&gsc.sort=date"

    # Create an HTML session to handle the request
    session = HTMLSession()
    
    # Fetch the news search page
    response = session.get(news_url, headers=headers)
    
    # Render the JavaScript on the page
    response.html.render(sleep=2)  # Wait for 2 seconds for JavaScript execution
    
    # Parse the rendered HTML to find article links
    soup = BeautifulSoup(response.html.html, 'html.parser')
    content = soup.find_all('a', attrs={'class': 'gs-title'})
    
    # Check if any articles were found
    if not content:
        return "No articles found."

    # Get the href of the first article
    href = content[0].get('href')
    
    # Use WebBaseLoader to load the content of the article
    loader = WebBaseLoader(href)
    
    # Return the loaded content
    docs = loader.load()[0]
    return docs.page_content


if __name__ == '__main__':
    query = "Latest news about typhoon"
    res = news_tool(query)
    breakpoint()
