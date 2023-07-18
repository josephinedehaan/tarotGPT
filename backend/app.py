from flask import Flask, render_template
from gpt_api import fetch_tarot_reading

app = Flask(__name__)

@app.route('/')
def index():
        return render_template('index.html')

@app.route('/reading')
def reading():
        selected_cards = ['The Fool', 'The Magician', 'The High Priestess']
        output_message = fetch_tarot_reading(selected_cards)
        return render_template('reading.html', output_message=output_message)

@app.route('/sunny/<user_input>')
def sunny(user_input):
       return render_template('sunny.html', name = user_input)




if __name__ == '__main__':
    app.run(debug=True)