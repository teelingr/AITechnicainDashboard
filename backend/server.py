# flask dependencies
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS # allows cross-origin resource sharing
import json

# importing openai functions
from chatGPT import AiQuery, Template, ReportFunctions
from newCase import NewCase

# observing audio file changes for new cases
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import requests # this is different to 'request' for Flask
import io # for sending the pdf as a blob

# importing oculavis API functions
import oculavis
import oculavis_dev # Gavin's development version of the oculavis API functions

# google speech to text
import threading
from google.cloud import speech
import os
import re
import sys
import queue
import pyaudio

# decision tree and driveauto
from driveAuto import decisionTree

# PDF report generation
from docx import Document
from docx.shared import Inches
from docx.shared import Pt
from docx.enum.style import WD_STYLE_TYPE
from docx2pdf import convert

# for clearing the databases
from clearing import Clear

""" Initialisation and configuration """
# Initializing flask app
app = Flask(__name__)
CORS(app, origins=['http://localhost:3000'])

# A dire attempt to stop CORS errors
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

# Test to see if the server is online, returns a json object saying "Backend Online"
@app.route('/test', methods=['GET'])
def api():
    data = {
        "message":"All Systems Operational",
        }
    return jsonify(data)


""" Product section functions """
# Get the pdf file based on the filename passed
@app.route('/api/get-pdf/<filename>', methods=['GET'])
def get_pdf(filename):
    try:
        pdf_path = os.path.join('data/pdfs', filename)
        return send_file(pdf_path, mimetype='application/pdf')
    except Exception as e:
        return str(e)

# called by getSerialNumberInfo() route, accesses the database and returns the information for the serial number
def getProductInfo(serial_number):
    print(f"getProductInfo called with serial_number: {serial_number}")
    # Retrieve data from the database
    with open('backend/data/serial_number_database.json') as f:
        serial_number_data = json.load(f)

    product_info = serial_number_data["serial_numbers"][serial_number]
    return product_info

# called by getSerialNumberInfo() route, saves the serial number to a json file
def saveCurrentSerialNumber(serial_number):
    with open('backend/data/current_serial_number.json', 'w') as f:
        json.dump({"current_serial_number": serial_number}, f, indent=4)

# Returns the information for the serial number when fetched. Calls getSerialNumberInfo() function
@app.route('/api/get-serial-number-info', methods=['POST'])
def getSerialNumberInfoRoute():
    data = request.get_json()
    serial_number = data.get('serialNumber')

    if not serial_number:
        print("No data provided")
        return "Error: No data provided", 400

    # Fetch the product info based on the serial number
    product_info = getProductInfo(serial_number)
    print(f"product_info returned when server function was called: {product_info}")

    # Run a function that saves the serial number every time product info was accessed.
    saveCurrentSerialNumber(serial_number)

    return jsonify(product_info)

# Called by the serialNumbers() function to possible serial numbers, returns a list.
def getSerials(serial_number):
    print(f"get_product_info called with serial_number: {serial_number}")
    # Retrieve data from some source
    with open('backend/data/serial_number_database.json') as f: #This will break for everyone else but rob teehee
        serial_number_data = json.load(f)

    # get the product designation (model number) from the serial number
    # noting that we want to autocomplete the serial number. we use startswith() to do this
    serials = []
    for serial in serial_number_data["serial_numbers"]:
        if serial.startswith(serial_number):
            # print(f"serial number might be: {serial}")
            serials.append(serial)
    return serials

# Returns the possible serial numbers based on the string posted from frontend, essentially an autocomplete function. Calls getSerials() function
@app.route('/api/search-serial-number', methods=['POST'])
def serialNumbers():
    data = request.get_json()
    print(f"the data acquired was: {data}")
    if not data:
        print("No data provided")
        return "Error: No data provided", 400
    serial_number = data.get('serial_number')
    if not serial_number:
        print("No serial number provided")
        return "Error: No serial number provided", 400

    # Fetch the product info based on the serial number
    serials = getSerials(serial_number)
    print(f"serials returned when function was called: {serials}")

    if serials == []:
        print("Serials empty", serials)
        return "Error: No serials found for serial number " + serial_number, 404
    
    return jsonify(serials)


""" Remote Service Action Functions""" 

# invite a guest to a remote service session
@app.route('/api/invite-to-remote-service', methods=['POST'])
def inviteRemote():

    # get the data from the POST request
    data = request.get_json()
    print(f"the data acquired was: {data}")

    # define the guest email
    guest_email = data.get('guest_email')
    print(f"the guest mail acquired was: {guest_email}")

    # define the sew technician email
    sew_technician_email = data.get('sew_technician_email')
    print(f"the tech name acquired was: {sew_technician_email}")

    # access the oculavis dev functions to get the ATS (Access Token String) and create the authorisation headers for oculavis API calls
    headers = oculavis_dev.init_get_ATS(sew_technician_email)
    print(f"the headers acquired were: {headers}")

    # create the call, which returns the call_id and the invitation link
    call_id, invitationLink = oculavis_dev.create_Call_now(sew_technician_email, guest_email, 1, headers)
    print("Call created")

    # return the call_id and the invitation link
    data = {
        "call_id": call_id,
        "invitationLink": invitationLink
    }
    return jsonify(data)

########## Post New Audio for Case API ##########
@app.route('/post-audio', methods=['POST'])
def postAudio():
    print("postAudio called")
    caseInstance = NewCase()
    case_number = str(caseInstance.run())

    return case_number

########## Get case history data from database ##########
@app.route('/api/case_history', methods=['GET'])
def get_data():
    try:
        with open('./backend/data/caseHistoryDB.json') as json_file:
            data = json.load(json_file)
        return jsonify(data)
    except FileNotFoundError:
        return jsonify({'error': 'Data not found'})

########## Get audio file from backend database ##########
@app.route('/audio_download', methods=['POST'])
def get_audio():
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = app.make_default_options_response()
        return response
    
    audio_file_path = request.json['audioFilePath']
    try:
        print(audio_file_path)
        return send_file(audio_file_path, download_name='audioFile.webm')
    except Exception as e:
        return str(e), 404
    
########## Get case transcript from database ##########
@app.route('/transcript_download', methods=['POST'])
def get_transcript():
    try:
        with open('./backend/data/caseHistoryDB.json') as json_file:
            data = json.load(json_file)
        return jsonify(data)
    except FileNotFoundError:
        return jsonify({'error': 'Data not found'})
      
######### AI queries (ChatGPT) ##########
@app.route('/ai_query', methods=['POST'])
def ai_query():

    data = request.get_json()
    question = data['text']
    caseId = data['caseId']

    json_dir = os.path.join(os.path.dirname(__file__), 'data')
    json_path = os.path.join(json_dir, 'caseHistoryDB.json')

    with open(json_path, 'r') as json_file:
     cases = json.load(json_file)
     transcript = cases[caseId]['transcript']

    caseInstance = AiQuery()
    answer = caseInstance.ask_gpt(question, transcript)

    # answer = 'This functionality works; disabled to prevent unnecessary API calls.'

    return answer
  
############ Generate PDF #############
@app.route('/generate_pdf', methods=['POST'])
def generate_pdf():
    data = request.get_json()
    caseId = data['caseId']

    json_dir = os.path.join(os.path.dirname(__file__), 'data')
    json_path = os.path.join(json_dir, 'caseHistoryDB.json')

    with open(json_path, 'r') as json_file:
     cases = json.load(json_file)
     document = Document('./backend/data/template.docx')
     summary = cases[caseId]['summary']
     details, _ = ReportFunctions.getDetailsandResolution(cases[caseId]['transcript'], cases[caseId]['nameTechnician'], cases[caseId]['nameCustomer'])
     _, resolution = ReportFunctions.getDetailsandResolution(cases[caseId]['transcript'], cases[caseId]['nameTechnician'], cases[caseId]['nameCustomer'])

     length = cases[caseId]['callDuration']
     nameTechnician = cases[caseId]['nameTechnician']
     nameCustomer = cases[caseId]['nameCustomer']

    caseInstance = Template()

    filepath = caseInstance.createBoothPrintout(document, summary, details, resolution, length, nameTechnician, nameCustomer)

    with open(filepath, 'rb') as file:
        file_data = file.read()

    # Create an in-memory BytesIO object to hold the file data
    file_stream = io.BytesIO(file_data)

    # Send the file as a blob in the response
    return send_file(file_stream, mimetype='application/pdf', as_attachment=True, download_name='document.pdf')

############# Replacement function for getting pre-generated report ##############
@app.route('/get_report', methods=['POST'])
def get_report():
    data = request.get_json()
    caseId = data['caseId']

    with open('./backend/data/caseHistoryDB.json') as file: #open report database
        database = json.load(file)

    # Access the report path value
    report_path = str(database[str(caseId)]['report'])

    with open(report_path, 'rb') as report_file:
        file_data = report_file.read()

    # Create an in-memory BytesIO object to hold the file data
    file_stream = io.BytesIO(file_data)

    # Send the file as a blob in the response
    return send_file(file_stream, mimetype='application/pdf', as_attachment=True, download_name='report.pdf')
    

""" Decision Tree & DriveAuto Functions """
# Returns the liveSummary via a GET request
@app.route('/api/live-summary', methods=['GET'])
def getLiveSummary():
    # print("getLiveSummary route called")
    try:
        liveSummary, infoAdded, f, p, a = decisionTree.decisionTree() # single charachters are ignored in this particular route
        return jsonify(str(liveSummary))
    except TypeError as typeError:
        return jsonify("Compiling summary...")



# Fallback for when the fault code fails to be heard
@app.route('/api/fault-code-fallback', methods=['POST'])
def faultCodeFallback():
    print("faultCodeFallback route called")
    data = request.get_json()
    faultCode = data['value']
    print("fault code fallback received: ", faultCode)

    # check if the fault code exists in the fault code list
    with open('backend/data/fault_code_database.json', 'r') as outfile:
        data = json.load(outfile)

    # Extract the possible reason and activity from the fault code database
    possible_reasons = data[faultCode]["possible_reasons"]
    # print("possible reasons: ", possible_reasons)
    activities = data[faultCode]["activities"]
    # print("activities: ", activities)

    data = {
        "faultCode": faultCode,
        "possibleReasons": possible_reasons,
        "activities": activities
    }

    return jsonify(data)

@app.route('/api/heard-fault-code', methods=['GET'])
def heardFaultCode():
    # print("heardFaultCode route called")
    try:
        l, i, faultCode, possible_reasons, activities = decisionTree.decisionTree() # single charachters are ignored in this particular route

        # check if the fault code was found and is valid
        if len(faultCode) > 4:
            faultCode = ""
        
        # Structure the data to be returned
        dictionary = {
            "faultCode": faultCode,
            "possibleReasons": possible_reasons,
            "activities": activities
        }
        # print("fault code model returned data: ", dictionary)

        return jsonify(dictionary)

    except TypeError as typeError:

        dictionary = {
            "faultCode": "",
            "possibleReasons": [],
            "activities": []
        }
        return jsonify(dictionary)

@app.route('/api/heard-serial-number', methods=['GET'])
def heardSerialNumber():
    print("heardSerialNumber route called")
    data = request.get_json()

    # access something that contains the serial number
    # with open(...) as f:

    return jsonify("Serial number heard")


""" Live asynchronous speech-to-text transcription classes and functions (audio input directly to backend) """
""" You probably don't need to touch any code after this """

# Audio recording parameters
RATE = 16000
CHUNK = int(RATE / 10)
    
class MicrophoneStream(object):
    #Opens a recording stream as a generator yielding the audio chunks.

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
            # socketio.emit('transcription', {'transcription': transcript + overwrite_chars})

            # Open the JSON file in read/write mode
            with open("backend/data/chat_history.json", "r+") as file:
                # Load the existing data
                data = json.load(file)

                # Convert the data to a dictionary if it is a string
                if isinstance(data, str):
                    data = json.loads(data)

                # Get the current "chat" list
                chat = data.get("chat", [])

                # Append the new message to the "chat" list
                new_message = transcript + overwrite_chars
                chat.append(new_message)

                # Send full chat to the LLM
                # decisionTree(chat)

                # Update the JSON data with the modified "chat" list
                data["chat"] = chat

                # Move the file cursor to the beginning
                file.seek(0)

                # Write the modified data back to the file
                json.dump(data, file, indent=4)
                file.truncate()

            # Exit recognition if any of the transcribed phrases could be
            # one of our keywords (if exit or quit is voiced)
            if re.search(r"\b(exit|quit)\b", transcript, re.I):
                print("Exiting..")
                text = f":pink[Exiting..]"
                break

            num_chars_printed = 0

def liveTranscription():
    print("\nLive transcription function called")

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
        print("Speak into the microphone. Press Ctrl+C to stop.\n")

        # It then generates audio requests from the microphone stream
        audio_generator = stream.generator()

        # Send audio requests to the Google Cloud Speech API
        requests = (speech.StreamingRecognizeRequest(audio_content=content) for content in audio_generator)

        # Get responses from the Google Cloud Speech API
        responses = client.streaming_recognize(streaming_config, requests)

        # Feeds the responses to the listen_print_loop() function. This loops constantly.
        listen_print_loop(responses)

@app.route('/api/begin', methods=['POST'])
def begin():
    """ The begin function is called when the user clicks the 'start recording' button within DriveAuto.
        It starts the live transcription process and sends the first message to the LLM. 
        It clears the chat history and existing summary from the last call.
        It also creates a new case inside the case history database."""

    # As this is a post request the data is in the request body and is read first, it essentially contains:
    # { "value": true } stating that the checkbox is checked (and not unchecked)
    
    try:
        data = request.get_json()
    except json.JSONDecodeError: # if the request is empty
        data = {}

    # Get the value of the checkbox (checkbox is now a button stating true or false, keeping 'isChecked' as it doesn't really change anything)
    isChecked = data.get('value')
    print(f"isChecked: {isChecked}")

    """ This is the main part of the function, it starts the live transcription process, clears the chat, and clears the live summary. """
    if isChecked == True:
        print("Clearing the previous chat history...")

        """ I want to turn these clearing functions into their own functions, then it can be a single line here """
        Clear.clearChatHistory() # clears the chat_history.json
        Clear.clearLiveSummary() # clears the liveSummary.json

        print('Starting the live transcription function now...')
        # run the live transcription function on another thread (requires google cloud platform credentials)
        thread = threading.Thread(target=liveTranscription)
        thread.start()

        # We want to start recording here, the mic should be enabled at this point, so we just need to save it somewhere

    return jsonify({'checked': isChecked})

""" End of live transcription code """

# Running app
if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)