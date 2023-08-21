from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from gpt_api import fetch_tarot_reading, chat
import json

app = Flask(__name__)
app.secret_key = 'secret'


@app.route('/')
def index():
        return render_template('index.html')

def create_card_dict_from_json(filename):
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
                "arcana": card['arcana'],
            }
            card_dict[key] = value
    return card_dict

card_descriptions = create_card_dict_from_json('static/cards.json')

@app.route('/reading')
def reading():
        return render_template('reading.html')

@app.route('/card/<card_name>')
def card_detail(card_name):
    card = card_descriptions.get(card_name)
    if card:
        return render_template('card.html', card=card)
    else:
        return "Card not found", 404


@app.route('/learn')
def learn():
        return render_template('learn.html', cards=card_descriptions.values())

@app.route('/chat/submit_reading', methods=['POST'])  # Accept POST requests for '/gpt'
def gpt():
    data = request.get_json()  # Get the JSON data sent from JavaScript
    output_message = fetch_tarot_reading(json.dumps(data))
    return jsonify(output_message=output_message)  # Return the JSON response

@app.route('/chat/<message_type>', methods=['POST'])
def chatf(message_type):
        data = request.get_json()
        message = data.get('message', None) 
        message += '🜑'
        card_name = data.get('cardName', None)
        output_message = chat(message_type, message, card_name)
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
    app.config.update(
    SESSION_PERMANENT=False,
    SESSION_TYPE="filesystem"
    )    
    
    app.run(host='0.0.0.0', debug=True)