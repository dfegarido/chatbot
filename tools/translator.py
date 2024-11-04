# Load model directly
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM


def translate(text, model_id):

    tokenizer = AutoTokenizer.from_pretrained(model_id)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_id)

    encoded_input = tokenizer(text, return_tensors="pt")

    # Generate translation with specified max_new_tokens
    generated_tokens = model.generate(
        **encoded_input,
        num_beams=4,        # Use beam search for better quality
    )


    result = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)
    return result[0]