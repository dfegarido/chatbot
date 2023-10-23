# This file is to Q and A base on the file load 
from dotenv import load_dotenv
from langchain.llms import HuggingFacePipeline
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.document_loaders import TextLoader, DirectoryLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import Chroma, FAISS
from langchain.chains import RetrievalQA    
from transformers import pipeline, AutoModelForCausalLM, AutoTokenizer

load_dotenv()


# llms
repo_id = "facebook/mbart-large-50-many-to-many-mmt"
model_path = 'test/save_model/facebook-translator'



tokenizer = AutoTokenizer.from_pretrained(repo_id)
model = AutoModelForCausalLM.from_pretrained(repo_id)

tokenizer.save_pretrained(save_directory=model_path)
model.save_pretrained(save_directory=model_path)

article_hi = 'Certainly. To provide additional context, the idea of the "Kingdom of Maharlika" as proposed by Ferdinand Marcos has been met with criticism and controversy for several reasons'

model.src_lang = "en_XX"
encode = tokenizer.encode(article_hi + tokenizer.eos_token, return_tensors='pt')
generated_tokens = model.generate(encode, max_length=1000, pad_token_id=tokenizer.eos_token_id)
t = tokenizer.decode(generated_tokens, skip_special_tokens=True)
print(t)