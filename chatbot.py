from langchain.llms import OpenAI
from integrations.hf_llms import HuggingFaceHubLLMS

llm_openai = OpenAI(temperature=0.9, )
# llm_hf = HuggingFaceHubLLMS(temp=0.9, max_length=512).llm


question = 'what are the best food in the philippines'

print('testing')

output = llm_openai(question)
print(output)

# output = llm_hf(question)
# print(output)
