import requests
import os
import json
from flask import session


def fetch_tarot_reading(selected_cards):
    api_key = os.environ.get('OPENAI_KEY')

    print(api_key)
    url = 'https://api.openai.com/v1/engines/text-davinci-003/completions'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f"Bearer {api_key}"
    }

    prompt = f"Reply with a ~200 character paragraph: go over the meaning of each card provided and emphasise what its position is (eg past, present, future, etc). \
            Make sure to mention what the cards mean in relation the user's question, if they've provided one \
            Do not refer to cards spatially but in relation to the position field provided in JSON. End by referencing the user's initial question if they had one. \
            Always refere to the user as 'you' and the tarot reader as 'I'. \
            The cards are now shuffled and dealt, do not prompt the user to shuffle the cards again. \
            Generated cards: {selected_cards}"
    data = {
        'prompt': prompt,
        'max_tokens': 350
    }

    session["log"].append(prompt)   

    print("session log: ", session["log"])

    try:
        response = requests.post(url, headers=headers, json=data)
        response_data = response.json()

        if 'choices' in response_data and response_data['choices']:
            message = response_data['choices'][0].get('text', '').strip()
            session["log"].append(f"TarotGPT: {message}")   
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


def chat(message):
    counter = session.get('counter', 0)
    counter += 1
    session['counter'] = counter


    if "log" not in session:
        session["log"] = []
        session["log"].append(f"You are TarotGPT, a tarot reader. Ask the user if they would like to ask the tarot any specific questions. \
                            If the user has no more questions, invite the user to press the shuffle cards button. This will provide you a tarot card spread. \
                            User messages will always end in with the following symbol: '🜑'. \
                            Never end your own messages with this symbol ('🜑'). \
                            ONLY reply as TarotGPT, but never start the reply with the text: \"TarotGPT\".")

    session["log"].append(f"User: {message}")   

    api_key = os.environ.get('OPENAI_KEY')

    print(api_key)
    url = 'https://api.openai.com/v1/engines/text-davinci-003/completions'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f"Bearer {api_key}"
    }

    #prompt = f"You are TarotGPT, a tarot reader. Greet the user and answer any questions the may ask. user: {message}"
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




