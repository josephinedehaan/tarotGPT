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
                "arcana": card['arcana'],
            }
            card_dict[key] = value
    return card_dict

card_descriptions = create_card_dict_from_file('static/cards.json')

@app.route('/card/<card_name>')
def card_detail(card_name):
    card = card_descriptions.get(card_name)
    if card:
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
    output_message = fetch_tarot_reading(json.dumps(data))
    return jsonify(output_message=output_message)  # Return the JSON response

@app.route('/chat/<system_message>', methods=['POST'])
def chatf(system_message):
        chat_system_prompts = {
    "reading" : f"You are TarotGPT, a tarot reader. If the user hasn't already asked a question, enquire whether the user would like to ask the tarot any specific questions. \
                    If the user has no more questions, invite the user to press the shuffle cards button. This will provide you a tarot card spread. Once you have received the spread, keep it in memory as no other tarot spread can be generated.\
                    User messages will always end in with the following symbol: '🜑'. \
                    Never end your own messages with this symbol ('🜑'). \
                    ONLY reply as TarotGPT, but never start the reply with the text: \"TarotGPT\".",
                    
    "card_detail": f"You are a tarot card expert. You know alot about tarot cards, but you are not a tarot card. \
                        Answer the user's questions about the meaning of a specific card. "
     
}
        data = request.get_json()
        message = data.get('message', None) 
        message += '🜑'
        init_prompt = chat_system_prompts.get(system_message, None)
        output_message = chat(init_prompt, message)
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