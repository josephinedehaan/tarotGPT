let cardObjectDefinitions = [];

// Path to the image for the back of the cards
const cardBackImgPath = '/static/assets/images/back.jpg'

// Container element for the cards
const cardContainerElem = document.querySelector('.card-container')

// Array to store card elements
let cards = []

// Array to store cards which have been flipped
let flippedCards = []

currentCardPos = 0;
cardLayout = ['.card-pos-a', '.card-pos-b', '.card-pos-c',
    '.card-pos-d', '.card-pos-e', '.card-pos-f',
    '.card-pos-g', '.card-pos-h', '.card-pos-i']

// cardLayout = shuffleArray(cardLayout)

// Buttons for game control
const playGameButtonElem = document.getElementById('playGame')
const revealCardsButtonElem = document.getElementById('revealCards')
const resetReadingButtonElem = document.getElementById('resetReading')
const simulateReadingButtonElem = document.getElementById('simulateReading')

// Number of cards in the game
const numCards = cardObjectDefinitions.length

// Game state flags
let gameInProgress = false
let shufflingInProgress = false
let cardsRevealed = false
let flipCounter = 0;

// Element for displaying current game status
const currentGameStatusElem = document.querySelector('.current-status')

// Element for displaying the selected card
const selectedCardElem = document.querySelector('.selected-card')
const readingTextElem = document.querySelector('.reading-text')

loadGame();

function resetReading(card) {
    playGameButtonElem.hidden = false;
    resetReadingButtonElem.hidden = true;
    simulateReadingButtonElem.hidden = true;
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
    revealCardsButtonElem.hidden = true;
    const defaultGridAreaTemplate = `"a a a" "a a a" "a a a"`;
    transformGridArea(defaultGridAreaTemplate);
    addCardsToAppropriateCell(card);
}

function revealCard(card) {
    if (canChooseCard() && flipCounter < 9 && !cardIsFlipped(card)) {
        flipCard(card, false);
        addToFlippedCardsList(card);
    }
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

// unhides the reveal cards button and attaches flipcards() function to it
function activateRevealCardsButton() {
    revealCardsButtonElem.hidden = false
    revealCardsButtonElem.addEventListener('click', () => flipCards())
}

// unhides the reset reading button
function activateResetReadingButton(card) {
    resetReadingButtonElem.hidden = false;
    resetReadingButtonElem.addEventListener('click', () => resetReading(card))
}

function activateSimulateReadingButton() {
    simulateReadingButtonElem.hidden = false;
    simulateReadingButtonElem.addEventListener('click', showReading)

}

// retrieves card name metadatata from card element
function getCardName(card) {
    return cardName = card.getAttribute("data-cardname")
}

// updates html with relevant card name only if the cards have been flipped
function showCardName(card) {
    cardName = getCardName(card)
    if (cardsRevealed || cardIsFlipped(card)) {
        updateStatusElement(selectedCardElem, "block", `<span class='badge'>${cardName}</span>`)
    }
}

// updates the display (flex, block, etc) of html element and gives the option of updating the innerhtml
function updateStatusElement(elem, display, innerHTML) {
    elem.style.display = display
    if (arguments.length > 2) {
        elem.innerHTML = innerHTML
    }
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


function showReading() {    
    alert('test')
    if (cardsRevealed) {
        // shows typing gif while waiting for response
        updateStatusElement(readingTextElem, "block", "<img src='/static/assets/graphics/typing.gif'>")
        // fetches the reading text from the server
        generateCardsPositionList();
    }
}

function generateCardsPositionList() {
    const cardList = generateSelectedCardsList();
    const positionList = ['past', 'present', 'future', 'mind', 'body', 'spirit', 'challenge', 'action', 'outcome'];
    const tarotCardsPositionList = [];

    for (let i = 0; i < cardList.length; i++) {
        const cardName = cardList[i];
        const position = positionList[i];
        tarotCardsPositionList.push({ card: cardName, position: position });
    }

    // alert(JSON.stringify({ selected_cards: tarotCardsPositionList }))

    // Make an API request to the Flask server
    fetch('/gpt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ selected_cards: tarotCardsPositionList })
    })
        .then(response => response.json())
        .then(data => {
            // Handle the response data if needed
            updateStatusElement(readingTextElem, "block", `<p>${data.output_message}</p>`)
        })
        .catch(error => {
            console.error('Error:', error);
        });

}

// returns boolean value to assess whether cards can or can't be chosen
function canChooseCard() {
    return gameInProgress == true && !shufflingInProgress && !cardsRevealed
}

// this gets called upon loading the page, creates all cards
function loadGame() {
    // Call the function to fetch card data
    createCards()
    cards = document.querySelectorAll('.tarot-card')  // creates array with all cards
    playGameButtonElem.addEventListener('click', () => startTarotReading()) // attaches startround function to play game button
    revealCardsButtonElem.hidden = true
    resetReadingButtonElem.hidden = true
    simulateReadingButtonElem.hidden = true
}

// this gets called when the play game button is clicked.
function startTarotReading() {
    initializeNewReading()
    shuffleCards()
}

function initializeNewReading() {
    playGameButtonElem.hidden = true
    gameInProgress = true
    shufflingInProgress = true
    cardsRevealed = false
}

function transformGridArea(areas) {
    cardContainerElem.style.gridTemplateAreas = areas
}

// ******* CONSIDER CHANGING THE WAY THIS FUNCTION WORKS. YOU NOW HAVE AN ARRAY WHERE CARDS GO IF THEY ARE FLIPPED
// COULD IT MAKE MORE SENSE TO CHECK ADD AND REMOVE FROM THE ARRAY? ************

function flipCard(card, flipToBack) {
    const innerCardElem = card.firstChild
    if (flipToBack && !innerCardElem.classList.contains('flip-it')) {
        innerCardElem.classList.add('flip-it')
    }
    else if (innerCardElem.classList.contains('flip-it')) {
        innerCardElem.classList.remove('flip-it')
    }
}

function flipCards(flipToBack) {
    cards.forEach((card, index) => {
        setTimeout(() => {
            flipCard(card, flipToBack);
            if (!flippedCards.includes(card.id)) {
                addToFlippedCardsList(card)
                console.log(flippedCards, card.id)
            }
        }, index * 100);
    });
    cardsRevealed = true;
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
            clearInterval(id)
            shufflingInProgress = false
            removeShuffleCasses()
            dealCards()
            activateRevealCardsButton()
            activateResetReadingButton(card)
            activateSimulateReadingButton()
        }
        else {
            shuffleCount++;
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

    // adds card name as metadata ussing data-name=name to card element
    addCardNameToElement(cardElem, cardItem.cardName)

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
        revealCard(card);
        showCardName(card);
    });
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
        alert(error)
    });