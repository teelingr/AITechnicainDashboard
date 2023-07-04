import os
import re
import sys
import queue
import pyaudio
from google.cloud import speech

# Audio recording parameters
RATE = 16000
CHUNK = int(RATE / 10)

class MicrophoneStream(object):
    """Opens a recording stream as a generator yielding the audio chunks."""

    def __init__(self, rate, chunk):
        self._rate = rate
        self._chunk = chunk
        self._buff = queue.Queue()
        self.closed = True

    def __enter__(self):
        self._audio_interface = pyaudio.PyAudio()
        self._audio_stream = self._audio_interface.open(
            format=pyaudio.paInt16,
            channels=1,
            rate=self._rate,
            input=True,
            frames_per_buffer=self._chunk,
            stream_callback=self._fill_buffer,
        )
        self.closed = False
        return self

    def __exit__(self, type, value, traceback):
        self._audio_stream.stop_stream()
        self._audio_stream.close()
        self.closed = True
        self._buff.put(None)
        self._audio_interface.terminate()

    def _fill_buffer(self, in_data, frame_count, time_info, status_flags):
        self._buff.put(in_data)
        return None, pyaudio.paContinue

    def generator(self):
        while not self.closed:
            chunk = self._buff.get()
            if chunk is None:
                return
            data = [chunk]
            while True:
                try:
                    chunk = self._buff.get(block=False)
                    if chunk is None:
                        return
                    data.append(chunk)
                except queue.Empty:
                    break
            yield b"".join(data)

def listen_print_loop(responses):
    # Iterates through server responses and prints them.

    # The responses passed is a generator that will block until a response
    # is provided by the server.

    # Each response may contain multiple results, and each result may contain
    # multiple alternatives; for details, see https://goo.gl/tjCPAU.  Here we
    # print only the transcription for the top alternative of the top result.

    # In this case, responses are provided for interim results as well. If the
    # response is an interim one, print a line feed at the end of it, to allow
    # the next result to overwrite it, until the response is a final one. For the
    # final one, print a newline to preserve the finalized transcription.

    num_chars_printed = 0
    for response in responses:
        if not response.results:
            continue

        # The `results` list is consecutive. For streaming, we only care about
        # the first result being considered, since once it's `is_final`, it
        # moves on to considering the next utterance.
        result = response.results[0]
        if not result.alternatives:
            continue

        # Display the transcription of the top alternative.
        transcript = result.alternatives[0].transcript

        # Display interim results, but with a carriage return at the end of the
        # line, so subsequent lines will overwrite them.
        #
        # If the previous result was longer than this one, we need to print
        # some extra spaces to overwrite the previous result
        overwrite_chars = " " * (num_chars_printed - len(transcript))

        if not result.is_final:
            sys.stdout.write(transcript + overwrite_chars + "\r")
            sys.stdout.flush()

            num_chars_printed = len(transcript)

        else:
            # sentance has ended and we can use this sentance, first we print it (console and front end)
            print(transcript + overwrite_chars)
            return transcript + overwrite_chars

            # Exit recognition if any of the transcribed phrases could be
            # one of our keywords.
            if re.search(r"\b(exit|quit)\b", transcript, re.I):
                print("Exiting..")
                text = f":pink[Exiting..]"
                break

            num_chars_printed = 0

#----------------------------------------------------

def asynchronousTranscription():
    # Start by setting the language code. See http://g.co/cloud/speech/docs/languages for a list of supported languages.
    language_code = "en-US"  # a BCP-47 language tag

    # Initializes the Google Cloud Speech client
    client = speech.SpeechClient()

    # Sets the recognition and streaming configurations
    ENCODING = speech.RecognitionConfig.AudioEncoding.LINEAR16
    config = speech.RecognitionConfig(encoding=ENCODING, sample_rate_hertz=RATE, language_code=language_code)
    streaming_config = speech.StreamingRecognitionConfig(config=config, interim_results=True)

    # Opens a microphone stream using the (class) MicrophoneStream context manager.
    with MicrophoneStream(RATE, CHUNK) as stream:
        print("\nSpeak into the microphone. Press Ctrl+C to stop.\n")

        # It then generates audio requests from the microphone stream
        audio_generator = stream.generator()

        # Send audio requests to the Google Cloud Speech API
        requests = (speech.StreamingRecognizeRequest(audio_content=content) for content in audio_generator)

        # Get responses from the Google Cloud Speech API
        responses = client.streaming_recognize(streaming_config, requests)

        # Feeds the responses to the listen_print_loop() function. This loops constantly.
        listen_print_loop(responses)

# run the ansynchronous transcription function, uncomment below to run it standalone
asynchronousTranscription()