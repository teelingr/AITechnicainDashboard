import os # access api keys and paths
import re # for regular expression matchmaking
import sys # for system-specific paramaters and functions
import json # database in json format
import time  # measures code speed and performance
import uuid # create unique service id for the dialogflow agent
import queue
import pyaudio

import pandas as pd  # read csv, df manipulation
import google.cloud.dialogflow as dialogflow # google cloud dialogflow service

from datetime import datetime  # using datetime objects
from google.cloud import speech # for live audio transcription
from google.oauth2.service_account import Credentials # access credentials for google cloud services

# Set Google Cloud credentials environment variable for authentication
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')

class vt:
# dialog flow api: virtual technician agent
	def virtualTechnician(text):
		# Load the service account credentials from the private key file
		credentials = Credentials.from_service_account_file(os.environ.get('DIALOGFLOW_API_KEY'))

		# Create a Dialogflow client instance
		session_client = dialogflow.SessionsClient(credentials=credentials)

		# Set the project ID and session ID
		project_id = "my-project-33461-dialogflow"
		session_id = str(uuid.uuid4())

		# Create a session
		session = session_client.session_path(project_id, session_id)

		# Define the request text input
		text_input = dialogflow.TextInput(text=text, language_code="en-US")

		# Define the request query input
		query_input = dialogflow.QueryInput(text=text_input)

		# Send the request to the API
		response = session_client.detect_intent(session=session, query_input=query_input)

		# Print the response from the API
		intent = response.query_result.intent.display_name
		chat = response.query_result.fulfillment_text
		return intent, chat

# Audio recording parameters
RATE = 16000 # low sample rate in general, but should be sufficient for this api
CHUNK = int(RATE / 10)  # the number of samples in each chunk of audio data, in this case it is 100ms

class MicrophoneStream(object):
    """Opens a recording stream as a generator yielding the audio chunks."""

    def __init__(self, rate, chunk):
        self._rate = rate
        self._chunk = chunk

        # Create a thread-safe buffer of audio data
        self._buff = queue.Queue()
        self.closed = True

    def __enter__(self):
        # opens the audio stream using the pyaudio library
        # and starts filling the buffer asynchronously using the _fill_buffer() method
        self._audio_interface = pyaudio.PyAudio()
        self._audio_stream = self._audio_interface.open(
            format=pyaudio.paInt16,
            # The API currently only supports 1-channel (mono) audio
            # https://goo.gl/z757pE
            channels=1,
            rate=self._rate,
            input=True,
            frames_per_buffer=self._chunk,
            # Run the audio stream asynchronously to fill the buffer object.
            # This is necessary so that the input device's buffer doesn't
            # overflow while the calling thread makes network requests, etc.
            stream_callback=self._fill_buffer,
        )

        self.closed = False

        return self

    def __exit__(self, type, value, traceback):
        # stops the audio stream, signals the generator to terminate
        self._audio_stream.stop_stream()
        self._audio_stream.close()
        self.closed = True
        # Signal the generator to terminate so that the client's
        # streaming_recognize method will not block the process termination.
        self._buff.put(None)
        self._audio_interface.terminate()

    def _fill_buffer(self, in_data, frame_count, time_info, status_flags):
        """Continuously collect data from the audio stream, into the buffer."""
        self._buff.put(in_data)
        return None, pyaudio.paContinue

    def generator(self):
        # a generator function that continuously yields audio data from the buffer until the stream is closed
        while not self.closed:
            # Use a blocking get() to ensure there's at least one chunk of
            # data, and stop iteration if the chunk is None, indicating the
            # end of the audio stream.
            chunk = self._buff.get()
            if chunk is None:
                return
            data = [chunk]

            # Now consume whatever other data's still buffered.
            while True:
                try:
                    chunk = self._buff.get(block=False)
                    if chunk is None:
                        return
                    data.append(chunk)
                except queue.Empty:
                    break

            yield b"".join(data)

# ---------------------------------------------------------------------------
"""These seem to be google dialog flow credentials"""
# Load the service account credentials from the private key file
credentials = Credentials.from_service_account_file(os.environ.get('DIALOGFLOW_API_KEY'))

# Create a Dialogflow client instance
session_client = dialogflow.SessionsClient(credentials=credentials)

# Set the project ID and session ID
project_id = "my-project-33461-dialogflow"
session_id = str(uuid.uuid4())

# Create a dialogflow session
session = session_client.session_path(project_id, session_id)

def runvtech(text):

  intent, chat = vt.virtualTechnician(text)
  return intent, chat

  def markdownChat(history):
    # output the chat history onto the dashboard, white if customer, green if virtual technician
    customer_chat = f":white[{history[-2][1]}]"
    print(customer_chat)
    v_technician_chat = f":green[{history[-1][1]}]"
    print(v_technician_chat)

  def checkIntent(intent):

    # when the customer is calling out the serial number of a product, this is picked up and relevant data is displayed
    if intent == 'Give Serial Number Intent':
  
      # create customer list from database and display a selection for technician
      customer_list = createCustomers()
      customer = st.sidebar.selectbox("Customer", customer_list, key=6)

      # using customer selection, create serial_id list from customer in database and display a selection for technician
      serial_id_list = HomeFunctions.createSerials(customer)
      serial_id = st.sidebar.selectbox("Serial ID", serial_id_list, key=7)

      displayRelevantData(customer, serial_id)
      
    if intent == 'Exit Intent':
      now = datetime.strftime(datetime.now(), '%Y%m%d_%H%M')
      filename = f'{now}_chat_history.json'
      filepath = f'chat_history_json/{filename}'
      with open(filepath, "w") as file:
        file.write(json.dumps(st.session_state.chat_history, indent=2, separators=(',', ': ')))

  def listen_print_loop(responses):
    # ChatGPT says this function: takes a generator of server responses as input and iterates through the responses, 
    # printing the top transcription alternative for each response

    """Iterates through server responses and prints them.

    The responses passed is a generator that will block until a response
    is provided by the server.

    Each response may contain multiple results, and each result may contain
    multiple alternatives; for details, see https://goo.gl/tjCPAU.  Here we
    print only the transcription for the top alternative of the top result.

    In this case, responses are provided for interim results as well. If the
    response is an interim one, print a line feed at the end of it, to allow
    the next result to overwrite it, until the response is a final one. For the
    final one, print a newline to preserve the finalized transcription.
    """
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

            # define the output as 'text'
            text = f":pink[{transcript + overwrite_chars}]"

            # access dialogflow and infer the intent and response from the user
            # run vtech and save the virtual technician's response
            intent, vtech_chat = runvtech(text)

            checkIntent(intent)

            # Exit recognition if any of the transcribed phrases could be
            # one of our keywords.
            if re.search(r"\b(exit|quit)\b", transcript, re.I):
                print("Exiting..")
                text = f":pink[Exiting..]"
                break

            num_chars_printed = 0

  intent = 'No intent'
  enable_transcription = True

  if enable_transcription:
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

      # It then generates audio requests from the microphone stream
      audio_generator = stream.generator()

      # Send audio requests to the Google Cloud Speech API
      requests = (speech.StreamingRecognizeRequest(audio_content=content) for content in audio_generator)

      # Get responses from the Google Cloud Speech API
      responses = client.streaming_recognize(streaming_config, requests)

      # Feeds the responses to the listen_print_loop() function. This loops constantly.
      listen_print_loop(responses)