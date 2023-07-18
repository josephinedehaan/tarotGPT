import requests
import os
import json

def fetch_tarot_reading(selected_cards):
    api_key = os.environ.get('OPENAI_KEY')

    print(api_key)
    url = 'https://api.openai.com/v1/engines/text-davinci-003/completions'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f"Bearer {api_key}"
    }

    prompt = f"You are a fortune teller that responds with a Tarot reading interpretation of three cards provided by the user. \
            Card 1 represents the past, Card 2 represents the present, Card 3 represents the future.\nUser: {', '.join(selected_cards)}"
    data = {
        'prompt': prompt,
        'max_tokens': 100
    }

    try:
        response = requests.post(url, headers=headers, json=data)
        response_data = response.json()

        if 'choices' in response_data and response_data['choices']:
            message = response_data['choices'][0].get('text', '').strip()
            return message
        else:
            return "Error: Invalid response from OpenAI API" + json.dumps(response_data)
    except requests.exceptions.RequestException as e:
        print('Error:', e)
        return None
