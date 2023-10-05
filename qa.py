# This file is to Q and A base on the file load 
from dotenv import load_dotenv
from langchain.llms import HuggingFacePipeline
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.document_loaders import TextLoader, DirectoryLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import Chroma, FAISS
from langchain.chains import RetrievalQA    
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM

load_dotenv()

# Load documents
loader = DirectoryLoader('.', glob="data/*.txt", show_progress=True, use_multithreading=True, loader_cls=TextLoader)
documents = loader.load()

# llms
repo_id = "google/flan-t5-large"
model_path = 'test/save_model/google'

tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSeq2SeqLM.from_pretrained(model_path)

tokenizer.save_pretrained(save_directory=model_path)
model.save_pretrained(save_directory=model_path)


gen = pipeline('text2text-generation', model=model, tokenizer=tokenizer, max_new_tokens=20)

llms = HuggingFacePipeline(pipeline=gen, verbose=True, model_kwargs={"temperature": 0})

# Embeddings
embeddings = HuggingFaceEmbeddings()



# Split characters
text_splitter = CharacterTextSplitter(chunk_size=512, chunk_overlap=0)
texts = text_splitter.split_documents(documents=documents)

# Chroma
vec_store = Chroma.from_documents(texts, embeddings)
qa = RetrievalQA.from_chain_type(
    llm=llms,
    chain_type="stuff",
    retriever=vec_store.as_retriever()
)


# Query

def query(text):

    print(f"Question: {text}")
    print(f"Answer: {qa.run(text)}")
    print(" ")



query("what is the origin about maharlika")
query("what is Kingdom of Maharlika")
query("Who is darwin fegarido")
query("summary of darwin")
query("what is the average price of the products")
