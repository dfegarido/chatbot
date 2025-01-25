from flask import Flask, request, jsonify
from flask_cors import CORS  # Import the CORS module
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from langchain_community.document_loaders.text import TextLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import CharacterTextSplitter
from langchain_community.vectorstores import FAISS

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes and origins (adjust as necessary)
CORS(app)

# Load environment variables
load_dotenv()

# Setup Groq model and other components
llm = ChatGroq(
    model="mixtral-8x7b-32768",
    temperature=0.6,
    max_retries=2,
)

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
    
    # Prepare messages for the Groq model
    messages = [
        ("system", f"""
            You are a highly intelligent, helpful, and friendly assistant named Nikka. 
            Avoid sounding robotic or overly formal. 
            Always respond in short and direct to the point.
            If the question is not related to context, dont include the context.
            Here's the context: {docs[0].page_content}
        """),
        ("human", user_input),
    ]


    
    # Invoke the Groq model with the messages
    res = llm.invoke(messages)

    # Return the response as JSON
    return jsonify({"response": res.content})

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True, port=10000)
