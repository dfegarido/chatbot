from transformers import Conversation
from transformers import pipeline

import scipy.io.wavfile
from dotenv import load_dotenv
from espnet2.bin.tts_inference import Text2Speech



load_dotenv()


def text_to_speech(inputs):

    model = Text2Speech.from_pretrained(
        "espnet/kan-bayashi_ljspeech_vits",
        # Only for FastSpeech & FastSpeech2 & VITS
        # speed_control_alpha=1.0,
        # Only for VITS
        # noise_scale=0.333,
        # noise_scale_dur=0.333,
        )

    speech = model(inputs)['wav']

    # Save the waveform as a WAV file
    output_wav_file = "audio.wav"
    scipy.io.wavfile.write(output_wav_file, rate=model.fs, data=speech.numpy())

    print(f"Waveform saved to {output_wav_file} with a sampling rate of {model.fs} Hz.")



def conversational(inputs):
    pipe = pipeline(task="conversational", model="facebook/blenderbot-400M-distill")
    return pipe(Conversation(inputs))


if __name__ == "__main__":
    text = "how are you"
    text_output = conversational(text)
    print(str(text_output))
    text_to_speech("this is a testing voice ")
