import requests
import os
import json
from flask import session

def fetch_tarot_reading(selected_cards):

    print("SNEED FUNCTION SNEEDED")
    api_key = os.environ.get('OPENAI_KEY')

    print(api_key)
    url = 'https://api.openai.com/v1/engines/text-davinci-003/completions'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f"Bearer {api_key}"
    }

    prompt = f"Generated cards: {selected_cards} Reply with a ~200 character paragraph: go over the meaning of each card provided and emphasise what its position is (eg past, present, future, etc). Offer some basic insight into how this spread can answer the question that was asked earlier (if a question was asked).  \Do not refer to cards spatially but in relation to the position field provided in JSON. Always refere to the user as 'you' and the tarot reader as 'I'."
    
    data = {
        'prompt': prompt,
        'max_tokens': 350
    }

    if "log" not in session:
        session["log"] = []
     
    session["log"].append(prompt)   
    session.modified = True
   

    print("FROM SESSION['log']:", session["log"])

    try:
        response = requests.post(url, headers=headers, json=data)
        response_data = response.json()

        if 'choices' in response_data and response_data['choices']:
            message = response_data['choices'][0].get('text', '').strip()
            session["log"].append(f"TarotGPT: {message}")   
            session.modified = True
            return message
        else:
            return "Error: Invalid response from OpenAI API" + json.dumps(response_data)
    except requests.exceptions.RequestException as e:
        print('Error:', e)
        return None


def remove_tarot_gpt_prefix(input_string):
    prefix = "TarotGPT: "
    if input_string.startswith(prefix):
        return input_string[len(prefix):]
    else:
        return input_string


def chat(system_message, message):
    counter = session.get('counter', 0)
    counter += 1
    session['counter'] = counter


    if "log" not in session:
        session["log"] = []
        session["log"].append(system_message)

    session["log"].append(f"User: {message}")   

    api_key = os.environ.get('OPENAI_KEY')

    print(api_key)
    url = 'https://api.openai.com/v1/engines/text-davinci-003/completions'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f"Bearer {api_key}"
    }

    data = {
        'prompt': ' '.join(session["log"]),
        'max_tokens': 1000
    }

    print(data)

    try:
        response = requests.post(url, headers=headers, json=data)
        response_data = response.json()

        if 'choices' in response_data and response_data['choices']:
            message = response_data['choices'][0].get('text', '').strip()
            message = remove_tarot_gpt_prefix(message)
            session["log"].append(f"TarotGPT: {message}")   

            return f"{message}"
        else:
            return "Error: Invalid response from OpenAI API" + json.dumps(response_data)
    except requests.exceptions.RequestException as e:
        print('Error:', e)
        return None




