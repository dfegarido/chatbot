# Load model directly
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch

model_id = "Helsinki-NLP/opus-mt-en-tl"

tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForSeq2SeqLM.from_pretrained(model_id)

def translate(text):

    encoded_input = tokenizer(text, return_tensors="pt")

    # Generate translation with specified max_new_tokens
    generated_tokens = model.generate(
        **encoded_input,
        max_new_tokens=50,  # Adjust this value as needed
        num_beams=4,        # Use beam search for better quality
        early_stopping=True  # Stop early if all beams finish
    )


    result = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)
    return result[0]