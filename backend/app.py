from flask import Flask, render_template
from gpt_api import fetch_tarot_reading

app = Flask(__name__)

@app.route('/')
def index():
        return render_template('index.html')

@app.route('/reading')
def reading():
        return render_template('reading.html')

@app.route('/gpt')
def gpt():
        selected_cards = ['The Fool', 'The Magician', 'The High Priestess']
        output_message = fetch_tarot_reading(selected_cards)
        return output_message, 200, {'Content-Type': 'application/json'}

@app.route('/test')
def test():
        return "<h1>Test</h1>"

if __name__ == '__main__':
    app.run(debug=True)