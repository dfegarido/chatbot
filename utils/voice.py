import asyncio
from gtts import  gTTS

def voice_converter(text):
    """Converts text to speech and saves it as an mp3 file asynchronously."""
    
    # Specify the language as Tagalog
    language = 'en'

    # Correctly pass tld as a keyword argument (not as a positional argument)
    tts = gTTS(text=text, lang=language, tld='com', slow=False)

    # Save the converted audio to a file (this happens synchronously in the background thread)
    tts.save("api/output/voice.mp3")
    return text

