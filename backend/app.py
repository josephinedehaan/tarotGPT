from flask import Flask, render_template, request, jsonify
from gpt_api import fetch_tarot_reading

app = Flask(__name__)

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


@app.route('/test')
def test():
        return "<h1>Test</h1>"

if __name__ == '__main__':
    app.run(debug=True)