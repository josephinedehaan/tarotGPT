from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from gpt_api import fetch_tarot_reading, chat

app = Flask(__name__)
app.secret_key = 'secret'

@app.route('/')
def index():
        return render_template('index.html')

@app.route('/reading')
def reading():
        return render_template('reading.html')

@app.route('/gpt', methods=['POST'])  # Accept POST requests for '/gpt'
def gpt():
    data = request.get_json()  # Get the JSON data sent from JavaScript

    # Assuming the JSON data sent from JavaScript is of the format:
    selected_cards = data.get('selected_cards', [])  # Extract the 'selected_cards' list

    # Extract card names from the 'selected_cards' list
    cardList = [card['card'] for card in selected_cards]

    output_message = fetch_tarot_reading(cardList)
    return jsonify(output_message=output_message)  # Return the JSON response

@app.route('/chat', methods=['POST'])  # Accept POST requests for '/gpt'
def chatf():
        data = request.get_json()  # Get the JSON data sent from JavaScript

        message = data.get('message', None) 

        output_message = chat(message)
        return jsonify(output_message=output_message)  # Return the JSON response

@app.route('/test')
def test():
        counter = session.get('counter', 0)
        counter += 1
        session['counter'] = counter
        return f'Counter: {counter}'

@app.route('/reset')
def clear_session():
    # Clear all data in the session
    session.clear()
    return redirect(url_for('reading'))

if __name__ == '__main__':
    app.run(debug=True)