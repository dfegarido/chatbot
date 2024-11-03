import urllib.parse
from langchain_community.document_loaders import WebBaseLoader
from langchain_core.tools import tool, StructuredTool
from bs4 import BeautifulSoup
from requests_html import HTMLSession
import pyppdf.patch_pyppeteer
from uuid import uuid4
import sys, os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain.agents import Tool
import aiohttp
from pydantic import BaseModel, Field
from typing import List

# Add src to Python Path to avoid errors in module import
sys.path.insert(0, os.path.abspath("./utils/"))
sys.path.insert(0, os.path.abspath("./tools/"))

from vectore_store import PineconeClient

# Initialize Pinecone client
pinecone_client = PineconeClient(index_name='news', dimension=1024)

# Define Pydantic models
class NewsQuery(BaseModel):
    '''Model for the news query input'''
    query: str = Field(..., description="Search query for news articles.")

class NewsArticle(BaseModel):
    '''Model for a news article'''
    role: str
    context: str

class NewsResponse(BaseModel):
    '''Model for the response containing news articles'''
    articles: List[NewsArticle]

def get_news(query: NewsQuery) -> str:
    results = pinecone_client.query_index(query=query)
    return ''.join(matches['metadata']['text'] for matches in results['matches'])

def update_db(data: List[NewsArticle]):
    pinecone_client.add_data(data)
    # Describe index stats
    details = pinecone_client.describe_index_stats()
    print(f"Total vectors count: {details['total_vector_count']}")

def news_update() -> NewsResponse:
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    pinecone_client.delete_index()
    pinecone_client._create_index()

    gma_network = "https://www.gmanetwork.com/news"
    news_url = f"{gma_network}/archives/just_in/"

    session = HTMLSession()
    response = session.get(news_url, headers=headers, verify=True)
    response.raise_for_status()
    response.html.render(sleep=2)

    soup = BeautifulSoup(response.html.html, 'html.parser')
    contents = soup.find_all('a', attrs={'class': 'story_link story'})

    if not contents:
        return NewsResponse(articles=[])

    articles = []

    for content in contents:
        href = content.get('href')
        loader = WebBaseLoader(href)
        [docs] = loader.load()

        docs_data = NewsArticle(role="system", context=docs.page_content)
        articles.append(docs_data)

    update_db(articles)

    return NewsResponse(articles=articles)

@tool
def news_tool(query: str) -> str:
    """
        Fetch the latest news articles based on a search query.

        This tool retrieves the most recent articles from GMA News related to a provided 
        search query. Simply input your query (e.g., “latest tech news”), and the tool 
        will return relevant articles.

        Args:
            query (str): A string representing the search term for news articles.

        Returns:
            Tool: A tool containing the latest news articles related to the query.
    """

    return 'this is a testing setup'

if __name__ == '__main__':
    query_input = "voltes v"
    res = get_news(NewsQuery(query=query_input))

    print(res)
