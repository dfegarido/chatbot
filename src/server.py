from flask import Flask, request, jsonify
from flask_cors import CORS  # Import the CORS module
import requests  # To make HTTP requests to Ollama API
from dotenv import load_dotenv
from langchain_community.document_loaders.text import TextLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import CharacterTextSplitter
from langchain_community.vectorstores import FAISS
import os

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes and origins (adjust as necessary)
CORS(app)

# Load environment variables
load_dotenv()

# Ollama API setup (assuming you are using an HTTP API)
OLLAMA_API_URL = os.getenv("OLLAMA_API", "http://localhost:11434")  # Adjust with your Ollama API URL

# Setup HuggingFace embedding and text splitter
embedding = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
text_splitter = CharacterTextSplitter(chunk_size=10000, chunk_overlap=0)

# Load and process documents
loader = TextLoader("data/whitepaper.txt")
documents = loader.load()
documents = text_splitter.split_documents(documents)
db = FAISS.from_documents(documents, embedding)

# Define the route to handle questions
@app.route('/chat', methods=['POST'])
def ask():
    # Get user input from the POST request
    data = request.get_json()
    user_input = data.get("content")
    
    if not user_input:
        return jsonify({"error": "Question is required"}), 400

    # Perform similarity search on the documents
    docs = db.similarity_search(user_input)

    # Prepare the context message
    context = docs[0].page_content  # Get the most relevant context

    # Prepare the messages for Ollama (assuming Ollama accepts a chat-style message format)
    prompt = f"""
        You are a highly intelligent, helpful, and friendly assistant named Nikka. 
        Avoid sounding robotic or overly formal. 
        Always respond in short and direct to the point.
        If the question is not related to context, don't include the context.
        Here's the context: {context}
    """

    # Prepare the request payload for Ollama API
    payload = {
        "model": "llama3.2:3b",
        "stream": False,
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": user_input}
        ]
    }


    try:
        # Make the request to Ollama API
        response = requests.post(f"{OLLAMA_API_URL}/api/chat", json=payload)
        
        # Check if the request was successful
        response.raise_for_status()

        # Get the response content
        result = response.json()
        response_content = result.get("message").get("content")
        
        return jsonify({"response": response_content})

    except requests.exceptions.RequestException as e:
        # Handle any errors (e.g., network issues, invalid responses)
        return jsonify({"error": str(e)}), 500

# Run the Flask app
if __name__ == "__main__":
    port = os.getenv("PORT") or 3000
    app.run(debug=True, port=port)
