import requests
import json
from ollama import Client, AsyncClient
import asyncio
import time

start_time = time.time()


# api_url = 'https://chatbot-yiq5.onrender.com'
api_url = 'http://localhost:11434'
# model_name = "smollm:135m"
# model_name = "smollm2:135m"
# model_name = "internlm2:1m"
model_name = "llama3.2:1b"

embedding_model = "paraphrase-multilingual"

import numpy as np
import re
from collections import Counter

def tokenize(text):
    """ Tokenize the text and return a list of lowercased words, removing punctuation. """
    return re.findall(r'\b\w+\b', text.lower())  # \b\w+\b matches whole words, removes punctuation

def text_to_vector(text, all_words_set):
    """ Convert text to a vector using word frequency, with the word list as a set. """
    word_counts = Counter(tokenize(text))  # Count word frequencies
    vector = np.zeros(len(all_words_set))  # Initialize a zero vector of appropriate length
    word_index = {word: idx for idx, word in enumerate(all_words_set)}  # Map words to indices
    
    for word, count in word_counts.items():
        if word in word_index:
            vector[word_index[word]] = count  # Populate vector with word counts

    return vector

def cosine_similarity(vec1, vec2):
    """ Compute cosine similarity between two vectors using NumPy. """
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    return dot_product / (norm1 * norm2) if norm1 != 0 and norm2 != 0 else 0

def check_relevance(data, response_ai, threshold=0.5):
    """ Check if the response is relevant to the data based on cosine similarity. """
    # Tokenize both texts and create a set of all unique words
    all_words_set = set(tokenize(data) + tokenize(response_ai))

    # Convert both texts into frequency vectors
    vector_data = text_to_vector(data, all_words_set)
    vector_response = text_to_vector(response_ai, all_words_set)

    # Compute cosine similarity between the vectors
    similarity_score = cosine_similarity(vector_data, vector_response)
    
    print(f"Similarity score: {similarity_score}")
    print(f"Threshold: {threshold}")

    # Return relevance based on threshold
    return 1 if similarity_score >= threshold else 0


print(f"Pulling model {model_name}")
client = Client(host=api_url)
response = client.pull(model_name)

if response["status"] == 'success':
    print("Pull successful")
else:
    print("Pull failed")


data = "A Global Advocate for LGBTQ+ Rights**\n\nMamen is a prominent gay activist whose work spans the globe, advocating for LGBTQ+ rights and challenging societal norms that marginalize sexual minorities. Her activism began at a young age, inspired by her own experiences and a deep empathy for those facing discrimination. Early on, she recognized that the fight for LGBTQ+ equality is not confined to any single country, but is a global struggle that demands attention to issues such as criminalization, social stigma, and violence against queer people.\n\nAs a key figure in international LGBTQ+ advocacy, Mamen has worked with governments, NGOs, and grassroots organizations to push for policy changes and create safer spaces for LGBTQ+ individuals. She has been especially active in regions where same-sex relationships are illegal or punishable by violence, such as parts of Africa, the Middle East, and Eastern Europe. Her advocacy has also focused on empowering local activists and raising awareness of intersectional issues—particularly the unique challenges faced by LGBTQ+ refugees, people of color, and transgender individuals.\n\nMamen's work is deeply personal. As a gay woman who has faced her own struggles, she brings a strong sense of empathy and urgency to her advocacy. She believes that visibility and representation are key to creating change, and she has made it her mission to provide hope and empowerment to those who feel invisible or oppressed.\n\nDespite the challenges, Mamen remains committed to her vision of a world where LGBTQ+ people can live openly, freely, and without fear. Her tireless work continues to inspire change, pushing for a future where love, equality, and human dignity prevail for all."


question = "tell me about elon musk"
prompt=f"Respond to this prompt: {question}, Using this data: {data}."

print("Generating  response...")
response = client.generate(model=model_name, prompt=prompt, stream=False)
generated_response = response['response']
print(" ")
# print("First generated response:", generated_response)
print(" ")


payload = [
        {
            "role": "system",
            "content": "your name is Rootay, You are a friendly assistant, always check the previous conversation"
        },
        {
            "role": "assistant",
            "content": generated_response
        },

        {
            "role": "user",
            "content": question
        }
    ]

print("Chatting...")
response = client.chat(model=model_name, messages=payload, stream=False)

# print('response from AI:', response['message']['content'])
print(" ")
print("Checking relevant")
content = response['message']['content']

# print(f'content : {content}')


# Check relevance
is_relevant = check_relevance(data, content, threshold=0.6)


print(" ")
print(f'Check if relevant : {is_relevant}')
print(" ")

prompt_question = f"""
                    Take the question: '{question}'.
                    Now, generate a new s version of this question that is shorter and easier to understand while keeping the meaning the same.
                    Make sure it is clear and simple. give me direct answer.
                    """


print("Generating  new question...")
response = client.generate(model=model_name, prompt=prompt_question, stream=False)
generate_question = response['response']
print('New question:', generate_question)
print(" ")


end_time = time.time()
execution_time = end_time - start_time
print(f"Execution time: {execution_time} seconds")