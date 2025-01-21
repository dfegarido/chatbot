import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from langchain.chat_models import ChatOpenAI
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
import docx
from langchain_groq import ChatGroq  # Assuming this is a working Langchain Groq wrapper


# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Load and initialize Groq or OpenAI client (Here, we use Groq for example purposes)
groq_api_key = os.getenv("GROQ_API_KEY")  # You can use Groq's API key here
llm = ChatGroq(
    model="llama-3.1-8b-instant",
    api_key=groq_api_key,  # Make sure to set the API key
    temperature=0.5,
    max_tokens=None,
    timeout=None,
    max_retries=1,
)

# Initialize memory to store the conversation history
memory = ConversationBufferMemory(memory_key="history", return_messages=True)

# Function to read the contents of a .docx file
def read_docx(file_path):
    doc = docx.Document(file_path)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return '\n'.join(full_text)

# Read the content of the .docx file once when the server starts
file_path = "data/whitepaper.docx"
document_content = read_docx(file_path)
# Remove '\n' (newlines) and replace them with spaces
document_content = document_content.replace("\n", " ")

# Define the prompt templates with the assistant's name "nikka"
template = """
    You're helpful AI assistant.
    Answer directly and short. Make sure to refer to the history and document if necessary.
"""
system_message = SystemMessagePromptTemplate.from_template(template)
human_message = HumanMessagePromptTemplate.from_template("{input}")
chat_prompt = ChatPromptTemplate.from_messages([system_message, human_message])

# Define the conversation chain
conversation_chain = ConversationChain(
    llm=llm,
    memory=memory,
    verbose=False,
)

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get("content", "")

    if not user_input:
        return jsonify({"error": "Missing 'content' in the request body"}), 400

    conversation_chain.run(document_content)
    conversation_chain.run("I want to call you Nikka")

    try:
        # Get the assistant's response
        response = conversation_chain.run(user_input)

        # Return the response to the user
        return jsonify({
            "response": response
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    port = os.getenv("SERVER_PORT", 5000)  # Default to 5000 if SERVER_PORT is not set
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=port)
