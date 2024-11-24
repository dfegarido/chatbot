import pyttsx3
import time
import asyncio
from gtts import  gTTS
import os

# Initialize the TTS engine
engine = pyttsx3.init()
engine.setProperty('rate', 150)  # Set speech rate
engine.setProperty('volume', 1)   # Set volume

def speak(text):
    """Speak the provided text using the initialized engine."""
    engine.say(text)
    engine.runAndWait()
    return text


def voice_converter(text):
    """Converts text to speech and saves it as an mp3 file asynchronously."""
    
    # Specify the language as Tagalog
    language = 'en'

    # Correctly pass tld as a keyword argument (not as a positional argument)
    tts = gTTS(text=text, lang=language, tld='com', slow=False)

    # Save the converted audio to a file (this happens synchronously in the background thread)
    tts.save("api/output/voice.mp3")
    return text

def speak_now(text):
    env = os.getenv("ENV")
    if env.lower() == "dev":
        speak(text)
    else:
        voice_converter(text)
    return text



if __name__ == "__main__":
    message = "Hello, I am your assistant. How can I help you today? Here is some more information about our services."
    
    # Start streaming the audio output
    speak_now(message)