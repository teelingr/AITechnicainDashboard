""" devlopment of oculavis API functions """
# functions to be added to oculavis.py when operational

""" Required Libraries """

import requests # for API calls
from datetime import datetime, timedelta # using datetime for filenames and call scheduling
import json # for parsing API responses
import os # for file handling on the os


""" Constants """

# API url 
API_URL = "https://sew.share-platform.com/shapa/api/v2.0/openapi.json"

# SEW-EURODRIVE specific API url
PLATFORM_URL = 'https://sew.share-platform.com'

# API credentials provided by SEW-EURODRIVE/Oculavis
USERNAME = 'unauthorized_user'
PASSWORD = 'dERSrFhpW+WXBiWh5tXnRHMZqln6PfYT'

# API key provided by SEW-EURODRIVE/Oculavis
API_KEY = 'tK5JKCT+c3=HjEKWYD1PpR1Reo98DbTj29E5WkKyLwTe==JniZSzxCde5E4sQCrsYHoNgBkZmpXjswtz4P4LcCTNfSvVI1R9cBC4ZnXK15TpNE96P4h+Nl4k4Wnn6V0n5c59etg6SzN/ub2si9HxH1jO0fCPFYUiyS6DwvWC5wwwBNPJ3QfXe60jGNICUQApjVAbrcd/YrSn2/eI2pbQGdyE/jiydppvnYGwzeNp8abHcCD8+jFQj6smTvd/r2PQ'


""" Oculavis API functions:

    1. init_get_ATS(technician_address) - gets the ATS (Access Token String) for other API calls
    2. create_Call_now(sew_technician, guest_mail, call_duration_hrs, headers) - creates a call from now for a given duration
    3. create_case(name, headers, description="This is a new case", location='Bruchsal', date=datetime.now().strftime('%Y-%m-%dT%H:%M:%S.%fZ'), ref_num=1) - creates a case
    4. get_call_link(call_id, headers) - gets the link to a call
    5. assign_call_to_case(call_ID, case_ID, headers) - assigns a call to a case
    6. get_docs(case_ID, target_folder) - gets the documents of a case and saves them to a target folder
    7. initiate_oculavis_now(techn_address, customer_address) - all in one (master) function """


# 1. This function is used to get the ATS (Access Token String) for other API calls
def init_get_ATS(technician_address):

    # headers for the API call
    headers = {
        'accept': 'application/json',
        'Authorization': API_KEY,
        'Content-Type': 'application/json',
    }

    # payload for the API call
    json_data = {
        'email': technician_address
    }

    try:
        # API POST request to get the ATS
        response = requests.post(
            # post request with (url, headers, payload)
            'https://sew.share-platform.com/shapa/api/v2.0/oauth/v2/token/', 
            headers=headers,
            json=json_data)

        """ response looks like this: 
            {
                "access_token_service":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzaG ... (for 365 characters)  
            } 
        """

        # check if the request was successful
        if response.status_code == 201: 

            # decode the response to get the ATS (Access Token String) payload
            ATS_payload = response.content.decode("utf-8")

            # jsonify the response
            ATS_payload = json.loads(ATS_payload)

            # get the ATS from the json 
            ATS = ATS_payload["access_token_service"]

            print('Oculavis ATS (Access Token String) acquired successfully! \n')
            print(f"Oculavis {len(ATS)} charachter access token string: ", ATS, '\n')

            # create the header for all other functions (header includes the ATS acquired above)
            headers = {
                'accept': 'application/json', # accept json response
                'Authorization': ATS, # use ATS for authorization
                'Content-Type': 'application/json', # content type is json
            }

            return headers # return the new headers for other API calls
        
        else:
            print(f'Received status code of {response.status_code}')
            return None

    except Exception as e:
        print('Error acquiring Oculavis ATS (Access token string): ', e)
        return None

# 2. Creates an email invitation for a call 1hr from now for a 1hr duration
def create_Call_now(sew_technician, guest_mail, call_duration_hrs, headers):

    # How far in the future should the call be scheduled?
    future = -2

    # Getting current time for call planning
    time_now = datetime.now() + timedelta(hours=future)
    print('time_now: ', time_now, '\n')

    time_now_for = time_now.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
    print('time_now_for: ', time_now_for, '\n')

    # save the duration of the call in hours
    call_duration_hours = call_duration_hrs 

    end = time_now + timedelta(hours=call_duration_hours)
    print('end: ', end, '\n')

    end_time_for=end.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
    print('end_time_for: ', end_time_for, '\n')

    # payload for the API call
    json_data = {
        'name': 'Example Call', # name (subject) of the call
        'scheduledStart': time_now_for, # start time of the call
        'scheduledEnd': end_time_for, # end time of the call
        'participants': [
            {
                'identifier': sew_technician, # identifier of the technician (email)
            },
            {
                'identifier': guest_mail, # identifier of the guest (email)
            },
        ],
        'sendEmail': True, # send an email to the guest
    }

    try:
        # create a POST request for the call creation
        response = requests.post(
            # post request with (url, headers, payload)
            'https://sew.share-platform.com/shapa/api/v2.0/calls/custom-creation/', # url for the API call (note the 'custom-creation' at the end)
            headers=headers,
            json=json_data)

        """ 
        response looks like this for status code 201:
            {
                'id': 109, 
                'name': 'Example Call', 
                'caseId': None, 
                'createdOn': '2023-05-23T15:08:11.104660+00:00', 
                'createdByUserId': 7, 
                'scheduledStart': '2023-05-23T18:08:01.932830+02:00', 
                'scheduledEnd': '2023-05-23T19:08:01.932830+02:00', 
                'realStart': None, 
                'realEnd': None, 
                'invitationLink': 'https://sew.share-platform.com/central/calls/invitation/?invitation_token=6f0f1e8b-5e5f-46f6-9877-4ff50dc72256&platform=sew.share-platform.com', 
                'participants': [
                    {
                        'user': {
                            'id': 7, 
                            'username': 'lasse.nehrdich.e@sew-eurodrive.de', 
                            'email': 'lasse.nehrdich.e@sew-eurodrive.de', 
                            'userType': 'internal'}, 
                            'status': 'offline', 
                            'color': '#18C39A'
                        }
                ], 
                'guestInvitee': [
                    {
                        'email': 'macdonga@tcd.ie'
                    }
                ], 
                'status': 'future',
                'chatGroupId': None
            }
        
        response looks like this for code 400:
            {
                "detail": {
                    "scheduledStart": [
                        "The field \"Scheduled Start\" cannot be set in the past."
                    ]
                }
            }

        or like this if the request was code 422:
            {
                'detail': [
                    {
                        'loc': ['body', 'scheduledStart'], 
                        'msg': 'invalid datetime format', 
                        'type': 'value_error.datetime'
                    }, 
                    {
                        'loc': []'body', 'scheduledEnd'], 
                        'msg': 'invalid datetime format', 
                        'type': 'value_error.datetime'
                    }, 
                    {
                        'loc': ['body', 'scheduledStart'], 
                        'msg': 'invalid datetime format', 
                        'type': 'value_error.datetime'
                    }, 
                    {
                        'loc': ['body', 'scheduledEnd'], 
                        'msg': 'invalid datetime format', 
                        'type': 'value_error.datetime'
                    }
                ]
            }
        """

        # Decode the response string
        response_str = response.content.decode('utf-8')
        print("Response string: ", response_str, "\n")

        # Parse the JSON string
        response_json = json.loads(response_str)
        print("Response json: ", response_json, "\n")

        # check if the request was successful (status code 201)
        if response.status_code == 201:

            print(f'Call invitation sent to {guest_mail}.')

            # Access the id field
            id_value = response_json['id']
            print(f'Call created, ID={id_value}')

            # Access the invitation link
            invitation_link = response_json['invitationLink']
            print(f'Call invitation link: {invitation_link}')

            return id_value, invitation_link

        else:
            # response was not 201
            print('Error creating an Oculavis call: ', response.status_code, '\n')

    except Exception as e:
        print('Error creating an Oculavis call: ', e)
        return None


# 3. creates a case
def create_case(name, headers, description="This is a new case", location='Bruchsal',
                date=datetime.now().strftime('%Y-%m-%dT%H:%M:%S.%fZ'), ref_num=1):
    json_data = {
        'name': name,
        'caseTypeId': 1,
        'description': description,
        'location': location,
        'status': 'open',
        'date': date,
        'reference_number': ref_num,
    }
    response = requests.post('https://sew.share-platform.com/shapa/api/v2.0/cases/', headers=headers, json=json_data)
    if response.status_code == 201:
        response_str = response.content.decode('utf-8')
        # Parse the JSON string
        response_json = json.loads(response_str)
        # Access the id field
        id_value = response_json['id']
        print(f'Case created, ID={id_value}')
        return id_value
    else:
        return response


# 4. returns the initation link for the specified call
def get_call_link(call_id, headers):
    response = requests.get(f'https://sew.share-platform.com/shapa/api/v2.0/calls/{call_id}', headers=headers)
    if response.status_code == 200:
        response_str = response.content.decode('utf-8')
        # Parse the JSON string
        response_json = json.loads(response_str)
        # Access the id field
        link = response_json['invitationLink']
    else:
        print(f"Fetching call failed: {response}")
    return link


# 5. assigns a call to a case
def assign_call_to_case(call_ID, case_ID, headers):
    data = f'{{\n  "call_id": {call_ID}\n}}'

    response = requests.put(f'https://sew.share-platform.com/shapa/api/v2.0/cases/{case_ID}/assign-call/',
                            headers=headers,
                            data=data)
    print(f'Call [{call_ID}] added to Case [{case_ID}]')


# 6. get the documents from an existing oculavis case folder
def get_docs(case_ID, target_folder):
    # ONLY WORKS FOR JPGs
    # so far creates always new subfolders, no idea why

    headers=init_get_ATS('lasse.nehrdich.e@sew-eurodrive.de')
    response = requests.get(
        f'https://sew.share-platform.com/shapa/api/v2.0/cases/{case_ID}/documents/Videos and Screenshots/',
        headers=headers)

    # Parse the JSON response
    print(response)
    response_data = json.loads(response.content)

    # Access the list of results
    results = response_data['results']

    # create new folder for this case
    parent_directory = os.path.dirname(target_folder)
    target_dir = os.path.join(parent_directory, f'case{case_ID}')
    os.makedirs(target_dir, exist_ok=True)

    ## for loop that saves the linkend documents
    for i in range(len(results)):
        # get the orginal file on oculavis database
        file_data = results[i]
        folder_details = file_data['content']
        file_id = folder_details['attachment']

        file_name = f'{target_dir}/C{case_ID}_F{i}.jpg'
        ##file writer to save the files as jpg
        file_raw = requests.get(file_id, headers=headers).content
        with open(file_name, 'wb') as file:
            file.write(file_raw)

    return response
    # print(response.content)


# 7. all in one function to be called from the backend
def initiate_oculavis_now(techn_address, customer_address):
    headers = init_get_ATS(techn_address)
    call_id = create_Call_now(techn_address, customer_address, 1, headers)
    case_id = create_case("Super_Case_Name", headers)
    assign_call_to_case(call_id, case_id, headers)
    link = get_call_link(call_id, headers)
    return link, call_id, case_id

