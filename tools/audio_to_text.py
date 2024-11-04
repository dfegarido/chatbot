import torch
from transformers import AutoProcessor, AutoModelForSpeechSeq2Seq

# Load the processor and model
processor = AutoProcessor.from_pretrained("openai/whisper-large-v3-turbo")
model = AutoModelForSpeechSeq2Seq.from_pretrained("openai/whisper-large-v3-turbo")

# Function to convert audio to text
def transcribe_audio(audio_file):
    # Load the audio file
    audio_input = processor(audio_file, return_tensors="pt", sampling_rate=16000).input_values

    # Perform the transcription
    predicted_ids = model.generate(
        **audio_input,
        num_beams=4
    )

    # Decode the predicted ids to text
    transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)

    return transcription[0]  # Return the first transcription result

# Example usage
if __name__ == "__main__":
    audio_path = "output/voice.mp3"  # Replace with your audio file path
    text = transcribe_audio(audio_path)
    print("Transcription:", text)
