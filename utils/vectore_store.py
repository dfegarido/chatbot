from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_ollama import OllamaEmbeddings
from langchain.schema import Document

embeddings = OllamaEmbeddings(
    model="mxbai-embed-large",
)

def similarity_search(documents, query):
    
    text_splitter = CharacterTextSplitter(chunk_size=10000, chunk_overlap=0)
    documents = text_splitter.split_documents(documents)

    db = FAISS.from_documents(documents, embeddings)

    docs = db.similarity_search(query)
    return docs[0].page_content

if __name__ == "__main__":
    text = """
    
        The Adventure of the Lost Key
        Once upon a time in a small village nestled between towering mountains, there was a young girl named Lily. Lily was curious and adventurous, always eager to explore the world beyond her home. One day, while rummaging through the attic of her family's old house, she stumbled upon an antique chest hidden beneath a dusty sheet. The chest was locked, but there was something strange about it—it didn’t have a keyhole.

        Puzzled, Lily examined the chest closely. She noticed a faint engraving on the side: “To open the chest, find the key of the forgotten.” Intrigued, she decided that she would discover the meaning of this cryptic message. Her grandmother, who had lived in the village her whole life, often told stories of ancient treasures and forgotten secrets buried deep in the mountains. Lily wondered if the key might be hidden somewhere in the village.

        Her first stop was the village library, a small stone building with shelves stacked high with old books and dusty scrolls. The librarian, Mr. Thompson, was an elderly man with a long white beard who loved to share stories with anyone who would listen. When Lily asked about the "key of the forgotten," Mr. Thompson raised an eyebrow but didn’t say a word. He simply handed her a book titled The Lost Secrets of the Mountain Folk.

        Lily spent hours in the library, flipping through the book. In it, she discovered that the "key of the forgotten" was not a physical object but a symbol of knowledge, passed down through generations. According to the book, only those who truly understood the past could uncover its secrets.

        Determined, Lily decided to travel to the old ruins at the foot of the mountains, where the village's ancestors had once lived. As she journeyed through the dense forest, she encountered a wise old fox who seemed to be watching her from a distance. When she stopped to rest, the fox approached and spoke.

        "You seek the key," said the fox, "but the key is not a thing—it is a truth. Only when you know the history of those who came before you will the chest reveal its contents."

        Lily felt a deep sense of understanding as the fox's words echoed in her mind. She realized that the chest was a metaphor, a challenge to discover not just the physical key but the wisdom hidden in the village’s past.

        After spending days searching the ruins and speaking to the village elders, Lily learned the lost stories of her ancestors—their struggles, their triumphs, and the lessons they had learned. Armed with this knowledge, she returned to the chest, now understanding its true meaning. As she placed her hand on the chest, it slowly opened, revealing not gold or jewels, but an ancient scroll filled with the wisdom of generations long past.

        Lily smiled, for she had unlocked the true treasure—the key to understanding the world and her place in it.


    """
    

    x = similarity_search(text, "What is Lily’s main goal in the story")  # Output: "Llamas
    print(x)  # Output: "Llamas are members of the camelid family meaning
