from flask import Flask, jsonify, request
from chatGPT import WhisperFunctions, ReportFunctions, Template
import json
import os
from datetime import date
import wave
import server

from docx import Document

# importing a server function
import server

class NewCase:
    def __init__(self):
        self.case_number = self.get_next_case_number()

    def run(self):
        print('run function called')
        case_number = self.storeCase()
        print('Beginning CallAI Function... Case number is:',self.case_number)
        self.callAI(self.case_number)

        return case_number


    def storeCase(self): #ISSUES TO BE FIXED WITH AUDIO FILE NAMING CONVENTION
        print('storeCase function called, case number is:', self.case_number)
        if 'audio' not in request.files:
            print('No file uploaded')
            return 'No file uploaded', 400
        
        file = request.files['audio']
        print('file requested')
        if file.filename == '':
            print('No file selected')
            return 'No file selected', 400
        
        elif file:
            filename = f"{self.case_number}.webm"  # Rename the file with case number
            print('filename given:', filename)
            file.save(os.path.join('./backend/data/recordings', filename))
            print(f'Case number: {self.case_number}')
            self.add_new_entry(self.case_number)
            return self.case_number
        
        else:
            print('Error in storeCase function')
    
    def get_current_date(self):
                current_date = date.today()
                formatted_date = current_date.strftime("%dth %B %Y")
                return formatted_date
    
    # FIX BELOW IF THERE IS TIME

    # def get_audio_duration(self, filepath):
    #     with wave.open(filepath, 'rb') as audio_file:
    #         frames = audio_file.getnframes()
    #         rate = audio_file.getframerate()
    #         duration = frames / float(rate)

    #         minutes = int(duration / 60)
    #         seconds = int(duration % 60)
    #         formatted_duration = f"{minutes:02d}:{seconds:02d}"
            
    #         return formatted_duration

    # def get_audio_duration(self, filepath):
    #     audio = AudioSegment.from_wav(filepath)
    #     duration = len(audio) / 1000  # Convert duration from milliseconds to seconds

    #     minutes = int(duration / 60)
    #     seconds = int(duration % 60)
    #     formatted_duration = f"{minutes:02d}:{seconds:02d}"

    #     return formatted_duration
    
    def getReportData():
        # First access the current serial number
        with open('./backend/data/current_serial_number.json', 'r') as file:
            data = json.load(file)

        serialNumber = data['current_serial_number']
        
        # Then access the company name and product name, can be done using an existing function from the server.py file
        allProductData = server.getProductInfo(serialNumber)

        companyName = allProductData['company']
        productName = allProductData['designation']

        return serialNumber, companyName, productName
    
    def add_new_entry(self, case_number):

        audioPath = './backend/data/recordings/' + str(case_number) + '.webm'
        print('audioPath is:', audioPath)

        customer_name = request.form.get('custName')  # Retrieve the customer name input
        technician_name = request.form.get('techName')

        todayDate = self.get_current_date()
        # callDuration = self.get_audio_duration(audioPath)
        with open('./backend/data/caseHistoryDB.json', 'r') as file:
            data = json.load(file)
        
        # Function for getting latest serial number and relevant company info, specifically for the case reports
        serialNumber, companyName, productName = NewCase.getReportData()


        # Create a new entry with empty fields - EDIT THIS TO ADD EXTERNAL INFO
        new_entry = {
            "company": companyName, 
            "dateTime": todayDate,
            "serial_number": serialNumber, 
            "product": productName,
            "transcript": "Transcript goes here",
            "summary": "Summary goes here",
            "subject": "Subject line goes here",
            "details": "Details go here",
            "resolution": "Resolution goes here",
            "audio": audioPath,
            "nameCustomer": customer_name,
            "nameTechnician": technician_name,
            "callDuration": "00:00", #To be fixed
            "report": "Link to report goes here"
        }

        # Add the new entry to the JSON structure at the specified location
        data[str(case_number)] = new_entry

        # Write the updated JSON data back to the file
        with open('./backend/data/caseHistoryDB.json', 'w') as file:
            json.dump(data, file, indent=4)
    
##############################################################################

    def callAI(self, case_number):
        with open('./backend/data/caseHistoryDB.json', 'r') as file:
            data = json.load(file)
            filepath = data[str(case_number)]['audio']

        audioInstance = WhisperFunctions()
        document = Document('./backend/data/template.docx')
       
        # Comment this block out to avoid unnecessary API calls

        print('calling OpenAI functions')

        speech = audioInstance.whisper(filepath)
        transcript = audioInstance.diarise(speech)
        summary = audioInstance.summary(transcript)
        subject = audioInstance.subject(summary)

        details, _ = ReportFunctions.getDetailsandResolution(transcript, data[str(case_number)]['nameTechnician'], data[str(case_number)]['nameCustomer'])
        _, resolution = ReportFunctions.getDetailsandResolution(transcript, data[str(case_number)]['nameTechnician'], data[str(case_number)]['nameCustomer'])

        print('Finished calling OpenAI functions')
        """Uncomment this block to replace api calls above with test data"""
        # transcript = "This is a test transcript"
        # summary = "This is a test summary"

        data[str(case_number)]['subject'] = subject
        data[str(case_number)]['transcript'] = transcript
        data[str(case_number)]['summary'] = summary
        data[str(case_number)]['details'] = details
        data[str(case_number)]['resolution'] = resolution

        length = data[str(case_number)]['callDuration']
        nameTechnician = data[str(case_number)]['nameTechnician']
        nameCustomer = data[str(case_number)]['nameCustomer']
        companyName = data[str(case_number)]['company']

        product = data[str(case_number)]['product']
        serialNumber = data[str(case_number)]['serial_number']

        caseInstance = Template()

        filepath = caseInstance.createBoothPrintout(document, summary, details, resolution, length, nameTechnician, nameCustomer, subject, product, serialNumber, companyName)

        data[str(case_number)]['report'] = str(filepath)
        
        with open('./backend/data/caseHistoryDB.json', 'w') as file:
            json.dump(data, file, indent=4)
        return 'Processing Complete'

    def get_next_case_number(self):
        # Load the JSON data from file
        with open('./backend/data/caseHistoryDB.json', 'r') as file:
            data = json.load(file)

        # Get the case numbers from the JSON data
        case_numbers = list(data.keys())

        # Convert case numbers to integers and sort them
        case_numbers_int = [int(case_number) for case_number in case_numbers]
        case_numbers_int.sort()

        # Return the last case number incremented by 1
        if case_numbers_int:
            last_case_number = case_numbers_int[-1] + 1
            return last_case_number

        # Return 1 if there are no entries
        return 0
    