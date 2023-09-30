import os
from langchain.llms import HuggingFaceHub

repo_id = 'google/flan-t5-large'
temp = os.getenv('LLM_TEMP')


class HuggingFaceHubLLMS:

    def __init__(self, repo_id='flan') -> None:
        self.repo_id = repo_id
        self.temp = 0.5
        self.max_legth = 64
        
    @property
    def llm(self):
        print(f'REPO : {self.repo_id}')
        return HuggingFaceHub(repo_id=self.repo_id, model_kwargs={"temperature":self.temp, "max_length": self.max_legth})

    @property
    def repo_lists(self) -> dict:
        repo_id =  {
                'flan': 'google/flan-t5-large',
                'dolly': 'databricks/dolly-v2-3b',
                'dolly': 'databricks/dolly-v2-3b',
                'camel': 'Writer/camel-5b-hf',
                'xgen': 'Salesforce/xgen-7b-8k-base',
                'falcon': 'tiiuae/falcon-40b',
                'internlm': 'internlm/internlm-chat-7b',
                'qwen': 'Qwen/Qwen-7B'
            }
        return repo_id

    
    def set_repo(self, repo_name):
        lists = self.repo_lists
        self.repo_id = lists[repo_name]
        return lists[repo_name]

