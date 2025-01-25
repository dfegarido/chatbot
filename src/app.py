from flask import Flask, request, jsonify
import requests
import os

app = Flask(__name__)

# Define the URL of the external API
external_api_url = os.getenv("SERVER_URL")

@app.route('/chat', methods=['POST'])
def get_token_name():
    # Get the request body
    incoming_data = request.json
    # You can adjust this if you need to use the incoming data for the request
    message = incoming_data.get('content')

    # Prepare the payload to send to the external API
    payload = {
        "content": message
    }

    # Send the POST request to the external API
    response = requests.post(f"{external_api_url}/chat", json=payload)

    # Check if the external API request was successful
    if response.status_code == 200:
        # Parse the JSON response from the external API
        response_data = response.json()
        return jsonify({
            'response': response_data.get('response', 'No response found')
        }), 200
    else:
        return jsonify({'error': 'Failed to get response from external API'}), 500

if __name__ == '__main__':
    app.run(debug=True, host=0.0.0.0, port=10000)
