import pyttsx3
import time

# Initialize the TTS engine
engine = pyttsx3.init()
engine.setProperty('rate', 180)  # Set speech rate
engine.setProperty('volume', 1)   # Set volume

def speak(text):
    """Speak the provided text using the initialized engine."""
    engine.say(text)
    engine.runAndWait()
    return text

def stream_output(text):
    """Simulate streaming output by speaking in chunks."""
    # Split the text into smaller chunks (e.g., sentences or phrases)
    chunks = text.split('. ')  # Split by sentence for example

    for chunk in chunks:
        if chunk:  # Check if chunk is not empty
            speak(chunk.strip())  # Speak each chunk
            time.sleep(0.5)  # Optional: pause between chunks for clarity

if __name__ == "__main__":
    message = "Hello, I am your assistant. How can I help you today? Here is some more information about our services."
    
    # Start streaming the audio output
    stream_output(message)