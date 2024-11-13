from sqlalchemy import create_engine, select, Column, String, Integer, text
from sqlalchemy.orm import sessionmaker, declarative_base
from langchain_community.chat_message_histories import SQLChatMessageHistory
from langchain_core.tools import tool
import os

Base = declarative_base()

# Define a Message model that represents your chat messages
class Message(Base):
    __tablename__ = 'history'
    # {'role': 'human', 'content': "My name is ***"}
    id = Column(Integer, primary_key=True)
    role = Column(String)
    content = Column(String)

class Memory:
    """Store all conversation"""

    def __init__(self):

        self._initialize_database()
        self._memory = None

    def _initialize_database(self):
        # Sqlite path
        sqlite_path = 'sqlite.db'

        # Create an SQLAlchemy engine
        engine = create_engine(f'sqlite:///{sqlite_path}')
        Base.metadata.create_all(engine)
        self.Session = sessionmaker(bind=engine)

        # create sync sql message history by connection_string
        self.memory = SQLChatMessageHistory(
            session_id=os.getenv("SESSION_ID", "foo"),
            connection=engine
        )

    def add_message(self, user, ai):
        """ Adding user and ai messages """
        session = self.Session()
        try:
            # Save messages to the database
            user_message = Message(role='human', content=user)
            ai_message = Message(role='ai', content=ai)
            session.add(user_message)
            session.add(ai_message)
            session.commit()
        finally:
            session.close()


    def get_messages(self, limit=20):
        session = self.Session()
        try:
            messages = session.query(Message).order_by(Message.id.desc()).limit(limit).all()  # Retrieve last 20 messages
            return [(msg.role, msg.content) for msg in messages]
        finally:
            session.close()

    def clear_messages(self):
        """Clear the message history."""
        session = self.Session()
        try:
            session.query(Message).delete()  # Clear the messages
            session.commit()
        finally:
            session.close()

    def get_conversation(self, user_id, limit: int = 10) -> list:
        """Retrieve a specific user's conversation."""
        session = self.Session()
        try:
            # Query the message history for the specific user
            messages = session.query(Message).filter(Message.user_id == user_id).limit(limit).all()
            return [(msg.role, msg.content) for msg in messages]
        finally:
            session.close()

    def search_conversations(self, keyword: str, limit: int = 10) -> list:
        """Search conversations by keyword."""
        session = self.Session()
        try:
            # Query for messages containing the keyword
            messages = session.query(Message).filter(Message.ai_response.like(f'%{keyword}%')).limit(limit).all()
            return [(msg.role, msg.content) for msg in messages]
        finally:
            session.close()

    def sql_query(self, raw_query):
        session = self.Session()
        try:
            result = session.execute(raw_query)
            messages = result.fetchall() 
            return [(msg.role, msg.content) for msg in messages]
        finally:
            session.close()
        

if __name__ == "__main__":
    m = Memory()
    
    m.add_message('hi','how are you?')
    m.get_messages()
    breakpoint()