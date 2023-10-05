import os
from langchain.llms import HuggingFaceHub

class HuggingFaceHubLLMS:

    def __init__(self, repo_id='flan', temp=0.5, max_length=64) -> None:
        self.repo_id = self.repo_lists[repo_id]
        self.temp = temp
        self.max_length = max_length
        
    @property
    def llm(self):
        return HuggingFaceHub(repo_id=self.repo_id, model_kwargs={"temperature":self.temp, "max_length": self.max_length})

    @property
    def repo_lists(self) -> dict:
        repo_id =  {
                'flan': 'google/flan-t5-xxl',
                'flan-large': 'google/flan-t5-large',
                'dolly': 'databricks/dolly-v2-3b',
                'camel': 'Writer/camel-5b-hf',
                'xgen': 'Salesforce/xgen-7b-8k-base',
                'falcon': 'tiiuae/falcon-40b',
                'internlm': 'internlm/internlm-chat-7b',
                'qwen': 'Qwen/Qwen-7B'
            }
        return repo_id

