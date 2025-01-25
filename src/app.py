from flask import Flask, request, jsonify, Response
import requests
import os
from flask_cors import CORS  # Import CORS

app = Flask(__name__)

# Enable CORS for the entire app
CORS(app)

# Define the URL of the external API
external_api_url = os.getenv("SERVER_URL")

@app.route('/chat', methods=['POST'])
def get_token_name():
    # Get the request body
    incoming_data = request.json
    message = incoming_data.get('content')

    # Prepare the payload to send to the external API
    payload = {
        "content": message
    }

    # Send the POST request to the external API with stream=True
    response = requests.post(f"{external_api_url}/chat-stream", json=payload, stream=True)

    # Check if the external API request was successful
    if response.status_code == 200:
        # A generator function to stream content from the external API
        def generate():
            for chunk in response.iter_content(chunk_size=1024):
                if chunk:
                    yield chunk.decode('utf-8')  # Decode bytes to string and yield the chunk
        
        # Return the streamed response to the client
        return Response(generate(), content_type='text/event-stream'), 200
    else:
        return jsonify({'error': 'Failed to get response from external API'}), 500

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=10000)
