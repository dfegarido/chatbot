import urllib.parse
from langchain_community.document_loaders import WebBaseLoader
from langchain_core.tools import tool, StructuredTool
from bs4 import BeautifulSoup
from requests_html import HTMLSession
from langchain.schema import Document

from uuid import uuid4
import sys, os


from langchain.agents import Tool
from pydantic import BaseModel, Field
from typing import List

from sqlalchemy import create_engine, select, Column, String, Integer, text
from sqlalchemy.orm import sessionmaker, declarative_base
from langchain_community.chat_message_histories import SQLChatMessageHistory
from langchain_core.tools import tool
import os

# Add src to Python Path to avoid errors in module import
sys.path.insert(0, os.path.abspath("./utils/"))
sys.path.insert(0, os.path.abspath("./tools/"))

from vectore_store import similarity_search

# Sqlite path
sqlite_path = 'news.db'

Base = declarative_base()

# Define a Message model that represents your chat messages
class Message(Base):
    __tablename__ = 'news'
    # {'role': 'human', 'content': "My name is ***"}
    id = Column(Integer, primary_key=True)
    role = Column(String)
    page_content = Column(String)

# Create an SQLAlchemy engine
engine = create_engine(f"sqlite:///{sqlite_path}")
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()



def update_db(data):
    session.add(data)
    session.commit()
    session.close()


def get_all_news():
    messages = session.query(Message).order_by(Message.id.desc()).all()  # Retrieve last 20 messages
    return [Document(page_content=msg.page_content) for msg in messages]


def news_update():
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

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

    for content in contents:
        href = content.get('href')
        loader = WebBaseLoader(href)
        scrape = loader.scrape()
        contents = scrape.find_all('div', attrs={'class': 'story_main'})
        if len(contents) > 0:
            text = contents[0]
        else:
            continue

        text_result = text.get_text()
        article = Message(role='system', page_content=text_result)
        update_db(article)


def clear_messages():
    try:
        session.query(Message).delete()  # Clear the messages
        session.commit()
    finally:
        session.close()

def query_news(query):

    articles = get_all_news()
    return similarity_search(articles, query)



if __name__ == '__main__':
    print("Updating news...")
    clear_messages()
    news_update()

    print("News updated")

