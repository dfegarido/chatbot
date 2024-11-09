from gtts import gTTS
import os

def voice_converter(text):

    # Specify the language as Tagalog
    language = 'tl'
    # Create the gTTS object
    tts = gTTS(text=text, lang=language, slow=False, tld='com.au')  # slow=False for normal speed

    # Save the converted audio to a file
    tts.save("api/output/voice.mp3")

