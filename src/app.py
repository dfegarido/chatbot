from transformers import AutoModelForQuestionAnswering, AutoTokenizer, pipeline

model_name = "deepset/roberta-base-squad2"

# a) Get predictions
nlp = pipeline('question-answering', model=model_name, tokenizer=model_name)
QA_input = {
    'question': 'where he graduated',
    'context': 'I, Darwin Fegarido, has worked as a full-stack developer since 2016, his birthday is april 14 1991, a period during which I have worked in different environments, from start-ups to international companies. I am a self-motivated and self-taught professional who likes to solve problems. I merge a passion for usability and user experience with technical knowledge to create cool digital experiences. My repertoire includes programming languages and tools such as ReactJS, Vue, NodeJS, Python, MySQL, PostgreSQL, Nginx, MongoDB, Redis, and Elasticsearch. I also deploy applications using cloud computing like AWS EC2, ECS, S3, Azure, Heroku, and Github, and configure CICD on Gitlab and Github.'
}
res = nlp(QA_input)
print(res)


