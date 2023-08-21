# TarotGPT

![enter image description here](screenshot.png)

TarotGPT is an interactive tarot-themed web app. It is divided into two sections. 

**Reading**: the primary function is the ‘tarot reading’ feature. This part of the application offers the user a personalised tarot reading by generating a randomised tarot card spread, and through the OpenAI GPT-3 API allows for a personalised tarot interpretation. 

**Learn**: the secondary feature is the ‘tarot learning’ space, a learning environment which allows the user to discover more information about individual tarot cards through a GPT-3-powered chatbot.

## Usage
To run an instance of TarotGPT carry out the following steps:
 1. Install Python dependencies: `pip install`
 2. Create a `.env` file and assign your OpenAI API Key to the variable `OPENAI_KEY`
 3. Start TarotGPT: `python3 app.py`
 4. Enjoy!

## Additional information
TarotGPT was created as part of the final project submission for the Computing for Digital Media MSc – it is the product of my own labour except where stated.

The card reading mechanism and animations borrow heavily from Gavin Lon's [Hunt the Ace](https://github.com/GavinLonDigital/HuntTheAceJSGame) card game.
