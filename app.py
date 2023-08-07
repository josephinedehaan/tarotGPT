from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from gpt_api import fetch_tarot_reading, chat
import json

app = Flask(__name__)
app.secret_key = 'secret'

@app.route('/')
def index():
        return render_template('index.html')

@app.route('/reading')
def reading():
        return render_template('reading.html')

def create_card_dict_from_file(filename):
    with open(filename, 'r') as f:
        data = json.load(f)
        card_dict = {}
        for card in data:
            key = card['urlName']
            value = {
                "name": card['cardName'],
                "description": card['description'],
                "imagePath": card['imagePath'],
                "urlName": card['urlName'],
            }
            card_dict[key] = value
    return card_dict

card_descriptions = create_card_dict_from_file('static/cards.json')

@app.route('/card/<card_name>')
def card_detail(card_name):
    card = card_descriptions.get(card_name)
    if card:
        print(card)
        return render_template('card.html', card=card)
    else:
        return "Card not found", 404


@app.route('/allcards')
def allcards():
    return render_template('all_cards.html', cards=card_descriptions.values())


@app.route('/learn')
def learn():
        return render_template('learn.html', cards=card_descriptions.values())

@app.route('/chat/submit_reading', methods=['POST'])  # Accept POST requests for '/gpt'
def gpt():
    data = request.get_json()  # Get the JSON data sent from JavaScript

    # Assuming the JSON data sent from JavaScript is of the format:
    #selected_cards = data.get('selected_cards', [])  # Extract the 'selected_cards' list

    # Extract card names from the 'selected_cards' list
    #cardList = [card['card'] for card in selected_cards]

    print("IN SUBMIT READING")
    output_message = fetch_tarot_reading(json.dumps(data))
    print("END SUBMIT READING")
    return jsonify(output_message=output_message)  # Return the JSON response

@app.route('/chat', methods=['POST'])
def chatf():
        data = request.get_json()

        message = data.get('message', None) 

        message += '🜑'

        output_message = chat(message)
        return jsonify(output_message=output_message)  # Return the JSON response

@app.route('/reset')
def clear_session():
    # Clear all data in the session
    session.clear()
    return redirect(url_for('reading'))

@app.route('/debug')
def my_debug():
        return session['log']

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)