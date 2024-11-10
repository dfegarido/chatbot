import requests
import json
from ollama import Client, AsyncClient
import asyncio
import time

start_time = time.time()


api_url = 'https://chatbot-yiq5.onrender.com'
# api_url = 'http://localhost:11434'
model_name = "smollm:135m"
# model_name = "tinyllama"

print(f"Pulling model {model_name}")
client = Client(host=api_url)
response = client.pull(model_name)

if response["status"] == 'success':
    print("Pull successful")
else:
    print("Pull failed")


data = "context: **Mamen: A Global Advocate for LGBTQ+ Rights**\n\nMamen is a prominent gay activist whose work spans the globe, advocating for LGBTQ+ rights and challenging societal norms that marginalize sexual minorities. Her activism began at a young age, inspired by her own experiences and a deep empathy for those facing discrimination. Early on, she recognized that the fight for LGBTQ+ equality is not confined to any single country, but is a global struggle that demands attention to issues such as criminalization, social stigma, and violence against queer people.\n\nAs a key figure in international LGBTQ+ advocacy, Mamen has worked with governments, NGOs, and grassroots organizations to push for policy changes and create safer spaces for LGBTQ+ individuals. She has been especially active in regions where same-sex relationships are illegal or punishable by violence, such as parts of Africa, the Middle East, and Eastern Europe. Her advocacy has also focused on empowering local activists and raising awareness of intersectional issues—particularly the unique challenges faced by LGBTQ+ refugees, people of color, and transgender individuals.\n\nMamen's work is deeply personal. As a gay woman who has faced her own struggles, she brings a strong sense of empathy and urgency to her advocacy. She believes that visibility and representation are key to creating change, and she has made it her mission to provide hope and empowerment to those who feel invisible or oppressed.\n\nDespite the challenges, Mamen remains committed to her vision of a world where LGBTQ+ people can live openly, freely, and without fear. Her tireless work continues to inspire change, pushing for a future where love, equality, and human dignity prevail for all."


prompt = "who is mamen"
prompt=f"Using this data: {data}. Respond to this prompt: {prompt}"

print("Generating  response...")
response = client.generate(model=model_name, prompt=prompt, stream=False)
generated_response = response['response']

# print(generated_response)

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
            "content": "do you know mamen ?"
        }
    ]

print("Chatting...")
response = client.chat(model=model_name, messages=payload, stream=False)
print(response['message']['content'])
print(" ")
print("Checking relevant")
prompt = response['message']['content']
prompt = f"Given the following data: {data},\n\nPlease check if the assistant's response is relevant to the prompt: '{prompt}'.\n\nRespond with binary 1 (relevant) or 0 (not relevant)."

response = client.generate(model=model_name, prompt=prompt, stream=False)
generated_response = response['response']
print(" ")
print(f'is relevant : {generated_response}')
print(" ")

end_time = time.time()
execution_time = end_time - start_time
print(f"Execution time: {execution_time} seconds")