import requests
from datetime import datetime, timedelta

tech_name1 = 'hannes.takenberg.e@sew-eurodrive.de'
tech_name2 = 'lasse.nehrdich.e@sew-eurodrive.de'
api_url = "https://sew.share-platform.com/shapa/api/v2.0/openapi.json"
PLATFORM_URL = 'https://sew.share-platform.com'
username = 'unauthorized_user'
password = 'dERSrFhpW+WXBiWh5tXnRHMZqln6PfYT'
API_KEY = 'tK5JKCT+c3=HjEKWYD1PpR1Reo98DbTj29E5WkKyLwTe==JniZSzxCde5E4sQCrsYHoNgBkZmpXjswtz4P4LcCTNfSvVI1R9cBC4ZnXK15TpNE96P4h+Nl4k4Wnn6V0n5c59etg6SzN/ub2si9HxH1jO0fCPFYUiyS6DwvWC5wwwBNPJ3QfXe60jGNICUQApjVAbrcd/YrSn2/eI2pbQGdyE/jiydppvnYGwzeNp8abHcCD8+jFQj6smTvd/r2PQ'

def init_get_ATS(technician_address):
    headers = {
        'accept': 'application/json',
        'Authorization': API_KEY,
        'Content-Type': 'application/json',
    }
    json_data = {
        'email': technician_address
    }
    # send API credentials, get ATS
    response = requests.post('https://sew.share-platform.com/shapa/api/v2.0/oauth/v2/token/', headers=headers,
                             json=json_data)

    ATS = response.content.decode("utf-8")
    ATS = ATS[25:-2]
    headers = {
        'accept': 'application/json',
        'Authorization': ATS,
        'Content-Type': 'application/json',
    }
    return headers

# Creates email invitation for call
def create_Call_now(techn, guest_mail, call_duration, headers):
    # getting current time
    time_now = datetime.now()
    time_now_for = time_now.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
    call_duration_hours = call_duration
    end = time_now + timedelta(hours=call_duration_hours)
    end_time_for=end.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
    json_data = {
        'name': 'Example Call',
        'scheduledStart': time_now_for,
        'scheduledEnd': end_time_for,
        'participants': [
            {
                'identifier': techn,
            },
            {
                'identifier': guest_mail,
            },
        ],
        'sendEmail': True,
    }

    #create a call
    response = requests.post('https://sew.share-platform.com/shapa/api/v2.0/calls/custom-creation/', headers=headers,
    json=json_data)
    print(f'Call invitation sent to {guest_mail}.')
    return response