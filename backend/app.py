from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
        return render_template('index.html')

@app.route('/reading')
def reading():
        return render_template('reading.html')

@app.route('/sunny/<user_input>')
def sunny(user_input):
       return render_template('sunny.html', name = user_input)




if __name__ == '__main__':
    app.run(debug=True)