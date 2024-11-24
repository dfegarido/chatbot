import requests
import os
from dotenv import load_dotenv
from langchain_core.prompts import (
    ChatPromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder
)
from langchain.prompts import PromptTemplate
from langchain_core.messages import SystemMessage, AIMessage, HumanMessage

load_dotenv()
class HomeAssistantTool:
    
    def __init__(self):
        self.url = "http://192.168.1.213:8123"
        self.token_key = os.getenv('HOMEASSISTANT_TOKEN')
        self.llm = None
        self.output_parser = None

    def _send_request(self, query):
        url = f"{self.url}/api/conversation/process"
        headers = {
            'Authorization': f'Bearer {self.token_key}',
            'Content-Type': 'application/json'}
        body = {
                "text": query,
                "language": "en"
            }

        response = requests.post(url, headers=headers, json=body)
        if response.status_code == 200:
            res = response.json()
            return res['response']['speech']['plain']['speech']

        return "Error: failed to send request"


    def generate(self, query):

        template = """
            You are a virtual assistant that controls and interacts with various devices in a smart home.
            You need to take an input like:
            - "Please turn off my xbox s"
            - "Turn on the living room lights"
            - "Play some music in the kitchen"

            Your task is to generate a simplified command in the following format:
            - turn off xbox s
            - turn on living room lights
            - play music kitchen

            Key Guidelines:
            1. The command should be **in lowercase**.
            2. Remove unnecessary words like "please" or "my".
            3. Directly indicate the **action** (e.g., "turn off", "turn on", "play") and the **device or location** (e.g., "xbox s", "living room lights", "kitchen").
            4. Always return a **direct and concise command**.

            Input:
            {user_input}

            Generate the simplified command as described above.
            Give always a direct answer.
        """

        # Create a PromptTemplate from the above template
        prompt = PromptTemplate(input_variables=["user_input"], template=template)

        chain = prompt | self.llm
        result = chain.invoke({"user_input": query})
        device_response = self._send_request(result)
        print("result :", result)
        print("device_response :", device_response)
        return device_response


if __name__ == "__main__":
    tool = HomeAssistantTool()
    print(tool.generate("please turn off the living room lights"))
