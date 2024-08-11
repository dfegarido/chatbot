import requests as req
import streamlit as st


def get_ai_response(text_input):
    url="http://localhost:8000/ollama/invoke"
    input_text = {
        "input":{
            "question": text_input
        }
    }
    response=req.post(url, json=input_text)


    return response.json()['output']



if __name__ == "__main__":

    st.title("Langchain Demo API")
    text_input = st.text_input("Enter your question")

    st.write(get_ai_response(text_input))