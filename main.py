import nltk
import random
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import SnowballStemmer

# Download required resources
nltk.download('punkt')
nltk.download('stopwords')

# Define a dictionary of English responses
responses = {
    "hello": ["Hello!", "Hi there!", "Greetings!"],
    "how are you?": ["I'm good, thanks!", "I'm doing well.", "I'm fine, thank you."],
    "what's your name?": ["I'm a chatbot.", "You can call me Chatbot."],
    "what time is it?": ["I don't have a clock.", "I'm sorry, I don't know the time right now."],
    "goodbye": ["Goodbye! Take care.", "See you later!"],
    "default": ["I don't understand. Can you please rephrase?", "Sorry, I can't answer that."]
}


def preprocess_text(text):
    # Tokenize the text into words
    tokens = word_tokenize(text)

    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    filtered_tokens = [
        token for token in tokens if token.lower() not in stop_words]

    # Stemming using SnowballStemmer
    stemmer = SnowballStemmer('english')
    stemmed_tokens = [stemmer.stem(token) for token in filtered_tokens]

    return stemmed_tokens


def get_response(message):
    # Clean and preprocess the input message
    message = message.strip().lower()
    preprocessed_message = preprocess_text(message)

    # Check if the message is in the responses dictionary
    for key in responses:
        print(key, preprocessed_message)

        if key in preprocessed_message:
            return random.choice(responses[key])

    return random.choice(responses["default"])


# Chat loop
print("Hello! I'm a chatbot. How can I assist you?")
while True:
    user_input = input("User: ")
    response = get_response(user_input)
    print("Chatbot:", response)
