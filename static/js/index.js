let cardObjectDefinitions = [];

const cardBackImgPath = '/static/assets/images/back.jpg'

const cardContainerElem = document.querySelector('.card-container')

let cards = []

let flippedCards = []

currentCardPos = 0;
cardLayout = ['.card-pos-a', '.card-pos-b', '.card-pos-c',
    '.card-pos-d', '.card-pos-e', '.card-pos-f',
    '.card-pos-g', '.card-pos-h', '.card-pos-i']

// Buttons for game control
const shuffleCardsButtonElem = document.getElementById('shuffleCards')
const revealCardsButtonElem = document.getElementById('revealCards')
const resetReadingButtonElem = document.getElementById('resetReading')
const backButtonElem = document.getElementById('back')

// Number of cards in the game
const numCards = cardObjectDefinitions.length

// Game state flags
let gameInProgress = false
let shufflingInProgress = false
let cardsRevealed = false
let flipCounter = 0;

// Elements for displaying text
const selectedCardElem = document.querySelector('.selected-card')
const readingTextElem = document.querySelector('.reading-text')

loadGame();

function resetReading(card) {
    // fetch the clear route in bg
    fetch('/reset')
    .then(response => response.json())
    .then(data => {
        console.log('Response:', data);
    }
    )
    .catch(error => {
        console.error('Error:', error);
    }
    );

    gameInProgress = false;
    shufflingInProgress = false;
    cardsRevealed = false;
    flipCounter = 0;
    flippedCards = [];
    updateStatusElement(selectedCardElem, "block", "")
    updateStatusElement(readingTextElem, "block", "")
    destroyCards()
    createCards()
    cards = document.querySelectorAll('.tarot-card')
    activateShuffleCardsButton()
    disableButton(revealCardsButtonElem, revealCards)
    disableButton(resetReadingButtonElem, resetReading)
    const defaultGridAreaTemplate = `"a a a" "a a a" "a a a"`;
    transformGridArea(defaultGridAreaTemplate);
    addCardsToAppropriateCell(card);
    updateStatusElement(selectedCardElem, "block", `<span class='badge'>Welcome</span>`)
    updateStatusElement(readingTextElem, "block", `<p class="gptText">Hi again! Ask the tarot a question or go ahead and shuffle the cards.</p>`)
    document.getElementById('deck-img').hidden = false;


}

function activateChat() {
    document.getElementById('sendButton').addEventListener('click', sendMessage);
    document.getElementById('messageInput').addEventListener('keyup', handleKeyPress);
}

function handleKeyPress(event) {
    // Check if the Enter key is pressed (keyCode 13)
    if (event.code === 'Enter') {
        event.preventDefault(); // Prevent form submission
        sendMessage(); // Send the message
    }
}

function sendMessage(route) {
    route = document.getElementById('chatbox').getAttribute('data-chat-type');

    // Get the user input from the input box
    const userInput = document.getElementById('messageInput').value;
    // Data to be sent in the POST request
    const data = {
        message: userInput
    };

    // attempt to extract the current card name from the chatbox, if it exists include it along with the message
    var currentCardName = document.getElementById('currentCardName');
    if (currentCardName === null) {
        currentCardName = "";  // Set a default value
    } else {
        data.cardName = currentCardName.innerHTML;
    }


    updateStatusElement(readingTextElem, "block", `${readingTextElem.innerHTML} <p class="userText">${userInput}</p>`)
    document.getElementById('messageInput').value = "";
    scrollToBottom();


    // Convert the data to JSON string
    const jsonData = JSON.stringify(data);

    // Make the POST request using the Fetch API
    fetch('/chat/' + route, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: jsonData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(responseData => {
            // Handle the response data here if needed
            console.log('Response:', responseData);
            updateStatusElement(readingTextElem, "block", `${readingTextElem.innerHTML} <p class="gptText"> ${responseData.output_message} </p>`)
            scrollToBottom();

        })
        .catch(error => {
            console.error('Error:', error);
            alert("Something went wrong. Please try quitting and reopening your browser.")
        });

}

function scrollToBottom() {
    const chatBody = document.getElementById('chatBody');
    chatBody.scrollTop = chatBody.scrollHeight;
}

// generate selected cards list 
function generateSelectedCardsList() {
    cards = document.querySelectorAll('.tarot-card')  // creates array with all cards
    // iterate through cards and make a list of card names using getCardName()
    const cardList = []
    for (let i = 0; i < cards.length; i++) {
        cardList.push(getCardName(cards[i]))
    }
    return cardList
}

// function to get card name from card object
function showReading() {
    if (cardsRevealed) {
        // shows typing gif while waiting for response
        updateStatusElement(readingTextElem, "block", `${readingTextElem.innerHTML} <img id='typingGIF' src='/static/assets/graphics/typing.gif'> `)
        // fetches the reading text from the server
        generateCardsPositionList();
    }
}

// function to remove typing gif ID from chatbox
function removeTypingGIF() {
    const typingGIF = document.getElementById('typingGIF')
    typingGIF.remove()
}


// generate JSON for selected cards and assigns them their position name
function buildSelectedCardsJSON() {
    const cardList = generateSelectedCardsList();
    const positionList = ['past', 'present', 'future', 'mind', 'body', 'spirit', 'challenge', 'action', 'outcome'];
    const tarotCardsPositionList = [];

    for (let i = 0; i < cardList.length; i++) {
        const cardName = cardList[i];
        const position = positionList[i];
        tarotCardsPositionList.push({ card: cardName, position: position });
    }
    return JSON.stringify({ selected_cards: tarotCardsPositionList })
}

function generateCardsPositionList() {
    cardsJson = buildSelectedCardsJSON()

    // Make an API request to the Flask server
    fetch('/chat/submit_reading', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: cardsJson
    })
        .then(response => response.json())
        .then(data => {
            // Handle the response data if needed
            // updateStatusElement(readingTextElem, "block", `<p>${data.output_message}</p>`)
            updateStatusElement(readingTextElem, "block", `${readingTextElem.innerHTML} <p class="gptText">${data.output_message} </p>`)
            removeTypingGIF()


        })
        .catch(error => {
            console.error('Error:', error);
            alert("Something went wrong. Please try quitting and reopening your browser.")
        });
}

// Returns boolean value stating whether card is in the list of flipped cards
function cardIsFlipped(card) {
    return flippedCards.includes(card.id);
}

// Adds card to flipped cards list and increases the flip counter by 1
function addToFlippedCardsList(card) {
    flippedCards.push(card.id)
    flipCounter++
}

// unhides the reveal cards button and attaches revealcards() function to it
function activateRevealCardsButton() {
    revealCardsButtonElem.addEventListener('click', revealCards)
    enableButton(revealCardsButtonElem)
}

// unhides the reset reading button
function activateResetReadingButton(card) {
    // resetReadingButtonElem.hidden = false;
    resetReadingButtonElem.addEventListener('click', () => resetReading(card))
    enableButton(resetReadingButtonElem)
}

function activateShuffleCardsButton() {
    shuffleCardsButtonElem.addEventListener('click', startTarotReading)
    enableButton(shuffleCardsButtonElem)
}

// retrieves card name metadatata from card element
function getCardName(card) {
    return cardName = card.getAttribute("data-cardname")
}

// updates html with relevant card name only if the cards have been flipped
function showCardName(card) {
    cardName = getCardName(card)
    cardUrl = card.getAttribute("data-cardurl")
    if (cardsRevealed || cardIsFlipped(card)) {
        updateStatusElement(selectedCardElem, "block", `<a href="/card/` + cardUrl +`"> <span  class='badge round-button pointer'>${cardName} <i class="fa-regular fa-circle-right"></i> </span> </a>`)
    }
}

// updates the display (flex, block, etc) of html element and gives the option of updating the innerhtml
function updateStatusElement(elem, display, innerHTML) {
    elem.style.display = display
    if (arguments.length > 2) {
        elem.innerHTML = innerHTML
    }
}

// returns boolean value to assess whether cards can or can't be chosen
function canChooseCard() {
    return gameInProgress == true && !shufflingInProgress && !cardsRevealed
}

// this gets called upon loading the page, creates all cards
function loadGame() {
    // Call the function to fetch card data
    createCards()
    activateChat()
    cards = document.querySelectorAll('.tarot-card')  // creates array with all cards
    disableButton(revealCardsButtonElem, revealCards)
    disableButton(resetReadingButtonElem, resetReading)
    activateShuffleCardsButton()
    attachHoverEventHandlerToBtn(shuffleCardsButtonElem)
    attachHoverEventHandlerToBtn(revealCardsButtonElem)
    attachHoverEventHandlerToBtn(backButtonElem)
    attachHoverEventHandlerToBtn(resetReadingButtonElem)
}

// this gets called when the play game button is clicked.
function startTarotReading() {
    if (!gameInProgress) {
        initializeNewReading()
        shuffleCards()
        document.getElementById('deck-img').hidden = true;
    }
}

function initializeNewReading() {
    gameInProgress = true
    shufflingInProgress = true
    cardsRevealed = false
}

function transformGridArea(areas) {
    cardContainerElem.style.gridTemplateAreas = areas
}


function flipCard(card) {
    const innerCardElem = card.firstChild
    if (innerCardElem.classList.contains('flip-it')) {
        innerCardElem.classList.remove('flip-it')
    }

}

// flips all cards
function revealCards() {
    cards.forEach((card, index) => {
        setTimeout(() => {
            flipCard(card);
            if (!flippedCards.includes(card.id)) {
                showCardName(card);
                addToFlippedCardsList(card)
            }
        }, index * 500);

    });

    cardsRevealed = true;
    disableButton(revealCardsButtonElem, revealCards)
    showReading()
}

// flips individual card if it hasn't been flipped already
function revealCard(card) {
    if (canChooseCard() && flipCounter < 9 && !cardIsFlipped(card)) {
        flipCard(card);
        addToFlippedCardsList(card);
    }
    if (flipCounter == 9) {
        disableButton(revealCardsButtonElem, revealCards)
    }
}


function removeInitialPosClass(){
    cards.forEach((card) => {
        card.classList.remove("initial-pos")
    })
}


function removeShuffleCasses() {
    cards.forEach((card) => {
        card.classList.remove("shuffle-left")
        card.classList.remove("shuffle-right")
    })
}

function animateShuffle(shuffleCount) {
    const random1 = Math.floor(Math.random() * numCards) + 1
    const random2 = Math.floor(Math.random() * numCards) + 1

    let card1 = document.querySelectorAll('.tarot-card')[Math.floor(Math.random() * document.querySelectorAll('.tarot-card').length)]; //document.getElementById(random1)
    let card2 = document.querySelectorAll('.tarot-card')[Math.floor(Math.random() * document.querySelectorAll('.tarot-card').length)]; //document.getElementById(random2)

    if (shuffleCount % 4 == 0) {
        card1.classList.toggle("shuffle-left")
        card1.style.zIndex = 100
    }
    if (shuffleCount % 10 == 0) {
        card2.classList.toggle("shuffle-right")
        card2.style.zIndex = 200
    }
}

function shuffleCards(card) {
    const id = setInterval(shuffle, 12)
    let shuffleCount = 0
    function shuffle() {
        animateShuffle(shuffleCount)
        if (shuffleCount == 250) {
            removeInitialPosClass()
            clearInterval(id)
            shufflingInProgress = false
            removeShuffleCasses()
            dealCards()
            activateRevealCardsButton()
            activateResetReadingButton(card)
            disableButton(shuffleCardsButtonElem, shuffleCards)
            updateStatusElement(selectedCardElem, "block", `<span class='badge'>Cards dealt</span>`)
        }
        else {
            shuffleCount++;
            updateStatusElement(selectedCardElem, "block", `<span class='badge'>Shuffling</span>`)
        }
    }
}

function increaseCardPos() {
    currentCardPos = (currentCardPos + 1) % 9;
}

function dealCards() {
    addCardsToAppropriateCell()
    const areasTemplate = `"a b c" "d e f" "g h i"`
    transformGridArea(areasTemplate)
}

function addCardsToAppropriateCell() {
    cards.forEach((card) => {
        addCardToGridCell(card)
    })
}

function randomiseArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function destroyCards() {
    const cardElements = document.querySelectorAll('.tarot-card');
    cardElements.forEach((card) => {
        card.remove();
    });
}

function createCards() {
    randomisedCards = randomiseArray(cardObjectDefinitions).slice(0, 9)
    randomisedCards.forEach((cardItem) => {
        createCard(cardItem)
    })
}

// creates cards by calling a series of functions
function createCard(cardItem) {
    // create div elements that make up a card
    const cardElem = createElement('div')
    const cardInnerElem = createElement('div')
    const cardFrontElem = createElement('div')
    const cardBackElem = createElement('div')

    // create front and back image elements for a card
    const cardFrontImg = createElement('img')
    const cardBackImg = createElement('img')

    // add class and id to card element
    addClassToElement(cardElem, 'tarot-card')
    addIdToElement(cardElem, cardItem.id)

    // add initial card position class to card element
    addClassToElement(cardElem, 'initial-pos')


    // adds card name as metadata ussing data-name=name to card element
    addCardNameToElement(cardElem, cardItem.cardName)
    addCardURLToElement(cardElem, cardItem.urlName)

    // add class to inner card elemet
    addClassToElement(cardInnerElem, 'card-inner')
    addClassToElement(cardInnerElem, 'flip-it')

    // add class to front cart element
    addClassToElement(cardFrontElem, 'card-front')

    // add class to card back elemnt
    addClassToElement(cardBackElem, 'card-back')

    // add src attribute and appropriate value to img element - back of card
    addSrcToImageElem(cardBackImg, cardBackImgPath)

    // add src attribute and appropriate value to img element - front of card
    addSrcToImageElem(cardFrontImg, cardItem.imagePath)

    // // assign class to back image elemnet of back of card
    // addClassToElement(cardBackImg, 'card-img')

    // // assign class to front image elemnet of front of card
    // addClassToElement(cardFrontImg, 'card-img')

    // assign class to back image elemnet of back of card
    addClassToElement(cardBackImg, 'img-fluid')

    // assign class to front image elemnet of front of card
    addClassToElement(cardFrontImg, 'img-fluid')

    // add front image element as child element to front card element
    addChildElement(cardFrontElem, cardFrontImg)

    // add back image element as child element to back card element
    addChildElement(cardBackElem, cardBackImg)

    // add front card element as a child element to inner card element
    addChildElement(cardInnerElem, cardFrontElem)

    // add back card element as a child element to inner card element
    addChildElement(cardInnerElem, cardBackElem)

    // add inner card element as child element to card element
    addChildElement(cardElem, cardInnerElem)

    // add card element as chld element to appropriate grid cell
    addCardToGridCell(cardElem)

    attachClickEventHandlerToCard(cardElem)
}

function attachClickEventHandlerToCard(card) {
    card.addEventListener('click', () => {
        startTarotReading();
        revealCard(card);
        showCardName(card);
    });
}

// updates status bar with button functionality (tooltip) whilst hovering on button
function attachHoverEventHandlerToBtn(button) {
    const originalText = selectedCardElem.innerHTML;

    button.addEventListener('mouseenter', () => {
        if (button.classList.contains('disabled-button')) {
            updateStatusElement(selectedCardElem, "block", `<span class='badge'>${button.title} (not allowed yet)</span>`);

        } else {
            updateStatusElement(selectedCardElem, "block", `<span class='badge'>${button.title}</span>`);

        }
    });

    button.addEventListener('mouseleave', () => {
        updateStatusElement(selectedCardElem, "block", originalText);
    });
}

// removes event listener and changes button appearnce to disabled by toggling classes
function disableButton(button, listenerFunction) {
    button.removeEventListener('click', listenerFunction)
    button.classList.add('disabled-button');
    button.classList.remove('btn-outline-light');
}

// changes button appearnce to enabled by toggling classes
function enableButton(button) {
    button.classList.remove('disabled-button');
    button.classList.add('btn-outline-light');
}

function createElement(elemType) {
    return document.createElement(elemType)
}

function addClassToElement(elem, className) {
    elem.classList.add(className)
}

function addIdToElement(elem, id) {
    elem.id = id
}

function addCardNameToElement(elem, cardName) {
    elem.setAttribute('data-cardname', cardName)
}

function addCardURLToElement(elem, url) {
    elem.setAttribute('data-cardurl', url)
}

function addSrcToImageElem(imgElem, src) {
    imgElem.src = src
}

function addChildElement(parentElem, childElem) {
    parentElem.appendChild(childElem)
}

// assesses whether the game is in progress and "places the cards in the correct grid area so to speak"
function addCardToGridCell(card) {
    let cardPositionClassName;

    if (gameInProgress == true && !shufflingInProgress && !cardsRevealed) {
        cardPositionClassName = mapCardIdToGridCell(card);
    }
    else {
        cardPositionClassName = '.card-pos-a';
    }

    const cardPosElem = document.querySelector(cardPositionClassName)
    addChildElement(cardPosElem, card)
}

function mapCardIdToGridCell(card) {
    position = cardLayout[currentCardPos]
    increaseCardPos();
    return position
}

fetch('/static/cards.json')
    .then(response => response.json())
    .then(data => {
        // console.log(data);
        cardObjectDefinitions = data;
        loadGame();
    })
    .catch(error => {
        console.error('Error loading JSON:', error);
        alert("Something went wrong. Please try quitting and reopening your browser.")
        alert(error)
    });
