import librosa
from transformers import AutoProcessor, AutoModelForSpeechSeq2Seq

# Load the processor and model
processor = AutoProcessor.from_pretrained("openai/whisper-large-v3-turbo")
model = AutoModelForSpeechSeq2Seq.from_pretrained("openai/whisper-large-v3-turbo")

# Function to convert audio to text
def transcribe_audio(audio_file):

    audio_input, _ = librosa.load(audio_file, sr=16000) 

    # Load the audio file
    audio_input = processor(audio_input, return_tensors="pt", sampling_rate=16000)

    # Perform the transcription
    predicted_ids = model.generate(**audio_input, language='tagalog', forced_decoder_ids=None, attention_mask=[])

    # Decode the predicted ids to text
    transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)

    return transcription[0]  # Return the first transcription result

# Example usage
if __name__ == "__main__":
    audio_path = "output/voice.mp3"  # Replace with your audio file path
    text = transcribe_audio(audio_path)
    print(text)
