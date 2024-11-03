from langchain_core.documents import Document
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from pinecone import Pinecone, ServerlessSpec
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_pinecone import PineconeEmbeddings, PineconeVectorStore
import requests
import os
import time
import uuid

class PineconeClient:
    def __init__(self, index_name="quickstart", dimension=768, metric="cosine"):
        self.api_key = os.getenv("PINECONE_API_KEY")
        self.pc = Pinecone(api_key=self.api_key)
        self.index_name = index_name
        self.dimension = dimension
        self.metric = metric
        # self.embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
        self.embeddings = PineconeEmbeddings(model="multilingual-e5-large")
        self.index = None
        self._create_index()

    def _create_index(self):
        """Create a Pinecone index if it doesn't already exist."""
        existing_indexes = [index.name for index in self.pc.list_indexes()]

        if self.index_name not in existing_indexes:
            self.pc.create_index(
                name=self.index_name,
                dimension=self.dimension,
                metric=self.metric,
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"
                )
            )
            # Wait for the index to be ready
            while not self.pc.describe_index(self.index_name).status['ready']:
                time.sleep(1)

        self.index = self.pc.Index(self.index_name)

    def get_groq_embedding(self, text):
        """Get the Groq embedding for a given text."""
        url = "YOUR_GROQ_EMBEDDING_API_ENDPOINT"  # Replace with your Groq API endpoint
        headers = {
            "Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}",
            "Content-Type": "application/json"
        }
        data = {"text": text}
        response = requests.post(url, headers=headers, json=data)

        if response.status_code == 200:
            return response.json().get("embedding")  # Adjust according to the actual response structure
        else:
            raise Exception(f"Error fetching embedding: {response.text}")

    @property
    def vector_store(self):
        return PineconeVectorStore(
            index=self.index,
            embedding=self.embeddings
        )

    @property
    def retriever(self, query: str) -> list:
        return self.vector_store.as_retriever()

    def add_data(self, data):
        """Embed the input data and upsert it to the index."""

        try:
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=10000,
                chunk_overlap=200
            )

            for conversation in data:
                chunks = text_splitter.split_text(conversation.context)  # Assuming 'context' is the text to embed
                vectors = []
                for i, chunk in enumerate(chunks):
                    vector = self.embeddings.embed_documents([chunk])[0] 
                    vectors.append({
                        "id": f"{conversation.role}-{uuid.uuid4()}",  # Unique ID for each entry
                        "values": vector,
                        "metadata": {'text': chunk}
                    })
                print(f"Inserting {chunk}")
                self.index.upsert(vectors=vectors, namespace="ns1")
            print(f"Successfully add data : total {len(data)}")
        except Exception as e:
            print(f"Error adding data : {str(e)}")


    def query_index(self, query, top_k=1):
        """Query the index and return the top_k results."""

        embedding = self.embeddings.embed_documents([query.query])[0]  # Get embedding for the query

        results = self.index.query(
            namespace="ns1",
            vector=embedding,
            top_k=top_k,
            include_values=False,
            include_metadata=True
        )

        return results

    def delete_index(self):
        """Delete the Pinecone index."""
        self.pc.delete_index(self.index_name)

        print(f"Index '{self.index_name}' deleted.")

    def describe_index_stats(self):
        """Get the index statistics."""
        return self.index.describe_index_stats()

# Example usage
if __name__ == "__main__":
    pinecone_client = PineconeClient(index_name='chat-history')
    # pinecone_client.delete_index()
    # Add some data
    # Sample data entries
    data_samples = [
        {
            "role": "user",
            "context": "What are the latest advancements in artificial intelligence?"
        }
    ]

    pinecone_client.add_data(data_samples)

    # Describe index stats
    details = pinecone_client.describe_index_stats()
    print(f"Total vectors count: {details['total_vector_count']}")

    # Query the index
    query = "what is supervise learning"
    results = pinecone_client.query_index(query)
    print(results)
