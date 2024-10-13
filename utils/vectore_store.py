from pinecone import Pinecone, ServerlessSpec
import os
import time
import uuid

class PineconeClient:
    def __init__(self, index_name="quickstart", dimension=1024, metric="cosine"):
        self.api_key = os.getenv("PINECONE_API_KEY")
        self.pc = Pinecone(api_key=self.api_key)
        self.index_name = index_name
        self.dimension = dimension
        self.metric = metric
        
        self._create_index()

    def _create_index(self):
        """Create a Pinecone index if it doesn't already exist."""
        existing_indexes = [index_name.name for index_name in self.pc.list_indexes()]

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

    def add_data(self, data, model="multilingual-e5-large"):
        """Embed the input data and upsert it to the index."""
        data = [{"id": str(uuid.uuid4()), "text": str(data)}]
        embeddings = self.pc.inference.embed(
            model=model,
            inputs=[d['text'] for d in data],
            parameters={"input_type": "passage", "truncate": "END"}
        )

        vectors = []
        for d, e in zip(data, embeddings):
            vectors.append({
                "id": d['id'],
                "values": e['values'],
                "metadata": {'text': d['text']}
            })

        self.index.upsert(
            vectors=vectors,
            namespace="ns1"
        )

    def query_index(self, query, clean=True, top_k=3, model="multilingual-e5-large"):
        """Query the index and return the top_k results."""
        embedding = self.pc.inference.embed(
            model=model,
            inputs=[query],
            parameters={"input_type": "query"}
        )

        results = self.index.query(
            namespace="ns1",
            vector=embedding[0].values,
            top_k=top_k,
            include_values=False,
            include_metadata=True
        )

        return self.clean_datasets(results) if clean else results

    def clean_datasets(self, results):
        """ Clean data from results """

        if len(results['matches']) > 0:
            return [result['metadata']['text'] for result in results['matches']]
        return []

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
    # data = {
    #         "role": "ai",
    #         "context": "A am fine"
    #         }
        


    # pinecone_client.add_data(data)
    # data = {
    #         "role": "ai",
    #         "context": "how about you??"
    #         }
    # pinecone_client.add_data(data)
    details = pinecone_client.describe_index_stats()
    print(f" Total vectors count {details['total_vector_count']}")

    query = "Alice Gou"
    results = pinecone_client.query_index(query, clean=True)
    print(results)
