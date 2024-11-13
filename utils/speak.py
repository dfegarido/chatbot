import pyttsx3
import time
engine = pyttsx3.init()


name = "Daniel" # Daniel or Samantha

# Get available voices
voices = engine.getProperty('voices')

    # Set speech rate (speed)
engine.setProperty('rate', 180)  # Default is around 200

# Set volume (0.0 to 1.0)
engine.setProperty('volume', 1)  # Full volume

def speak(text):
    for voice in voices:
        # if 'en_US' in data['languages'] and "(US)" in data['name']:
        if name == voice.name:
            voice.age = 5
            # Set voice (0 = male, 1 = female)
            engine.setProperty('voice', voice.id)  # Use voices[0] for male, voices[1] for female
            engine.say(text)

    engine.runAndWait()
    return text

if __name__ == "__main__":
    x = "Hello, I am your assistant. How can I help?".split()
    for i in x:
        print(i)
        speak(i)
