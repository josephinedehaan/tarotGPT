const cardObjectDefinitions = [
    {id:1, imagePath:'/images/1.jpg', cardName:'The Star'},
    {id:2, imagePath:'/images/2.jpg', cardName:'The Tower'},
    {id:3, imagePath:'/images/3.jpg', cardName:'The World'},
    {id:4, imagePath:'/images/4.jpg', cardName:'The Moon'},
    {id:5, imagePath:'/images/5.jpg', cardName:'Two of Swords'},
    {id:6, imagePath:'/images/6.jpg', cardName:'Two of Cups'},
    {id:7, imagePath:'/images/7.jpg', cardName:'Five of Cups'},
    {id:8, imagePath:'/images/8.jpg', cardName:'Eight of Cups'},
    {id:9, imagePath:'/images/9.jpg', cardName:'Ten of Sticks'},
]

const cardBackImgPath = '/images/back.jpg'

const cardContainerElem = document.querySelector('.card-container')

let cards = []

const playGameButtonElem = document.getElementById('playGame')

const cardCollectionCellClass = ".card-pos-a"

const numCards = cardObjectDefinitions.length

let cardPositions = []

let gameInProgress = false
let shufflingInProgress = false
let cardsRevealed = false

const currentGameStatusElem = document.querySelector('.current-status')

const scoreContainerElem = document.querySelector('.header-score-container')
const selectedCardElem = document.querySelector('.selected-card')


loadGame();

// if canchoosecard is true, flips one card then all the rest after a few seconds
function chooseCard(card) {
    if(canChooseCard())
    {
        flipCard(card, false)
        setTimeout(() => {
            flipCards(false)
            updateStatusElement(currentGameStatusElem, "block", "card positions revealed")
        }, 1000)
        cardsRevealed = true
    }
}

// retrieves card name metadatata from card element
function getCardName(card) {
    return cardName = card.getAttribute("data-cardname")
}

// updates html with relevant card name
function showCardName(card) {
    cardName = getCardName(card)
    updateStatusElement(selectedCardElem, "block", `<span class='badge'>${cardName}</span>`)
}

function updateStatusElement(elem, display, innerHTML) {
    elem.style.display = display
    if(arguments.length > 2)
    {
        elem.innerHTML = innerHTML
    }
}

// returns boolean value to assess whether cards can or can't be chosen
function canChooseCard() {
    return gameInProgress == true && !shufflingInProgress && !cardsRevealed
}

function loadGame(){
    createCards()
    cards = document.querySelectorAll('.card')
    playGameButtonElem.addEventListener('click', ()=>startRound())
}

function startRound() {
    initializeNewRound()
    addCardsToGridAreaCell(cardCollectionCellClass)
    shuffleCards()
}

function initializeNewRound() {
    playGameButtonElem.disabled = true
    gameInProgress = true
    shufflingInProgress = true
    cardsRevealed = false

    updateStatusElement(currentGameStatusElem, "block", "Shuffling... shuffling")
}


function transformGridArea(areas) {
    cardContainerElem.style.gridTemplateAreas = areas

}

function addCardsToGridAreaCell(cellPositionClassName) {
    const cellPositionElem = document.querySelector(cellPositionClassName)
    cards.forEach((card, index) => {
        addChildElement(cellPositionElem, card)
    })
}

function flipCard(card, flipToBack) {
    const innerCardElem = card.firstChild
    if(flipToBack && !innerCardElem.classList.contains('flip-it'))
    {
        innerCardElem.classList.add('flip-it')
    }
    else if(innerCardElem.classList.contains('flip-it'))
    {
        innerCardElem.classList.remove('flip-it')
    }
}

function flipCards(flipToBack) {
    cards.forEach((card, index)=>{
        setTimeout(() => {
            flipCard(card, flipToBack)
        },index *100)
    })
}

function removeShuffleCasses() {
    cards.forEach((card) =>{
        card.classList.remove("shuffle-left")
        card.classList.remove("shuffle-right")
    })
}

function animateShuffle(shuffleCount) {
    const random1 = Math.floor(Math.random() * numCards) + 1
    const random2 = Math.floor(Math.random() * numCards) + 1

    let card1 = document.getElementById(random1)
    let card2 = document.getElementById(random2)

    if (shuffleCount % 4 == 0)
    {
        card1.classList.toggle("shuffle-left")
        card1.style.zIndex = 100
    }
    if (shuffleCount % 10 == 0)
    {
        card2.classList.toggle("shuffle-right")
        card2.style.zIndex = 200
    }
}

function shuffleCards() {
    const id = setInterval(shuffle, 12)
    let shuffleCount = 0 
    function shuffle() {
        randomizeCardPositions()
        animateShuffle(shuffleCount)
        if(shuffleCount == 250)
        {
            clearInterval(id)
            shufflingInProgress = false
            removeShuffleCasses()
            dealCards()
            updateStatusElement(currentGameStatusElem, "block", "Click on any card to reveal cards")
        }
        else
        {
            shuffleCount++;
        }
    }
}

function randomizeCardPositions() {
    const random1 = Math.floor(Math.random() * numCards) + 1
    const random2 = Math.floor(Math.random() * numCards) + 1

    const temp = cardPositions [random1 - 1]

    cardPositions[random1 - 1] = cardPositions[random2 - 1]
    cardPositions[random2 -1] = temp
}

function dealCards() {
    addCardsToAppropriateCell()
    const areasTemplate = `"a b c" "d e f" "g h i"`
    transformGridArea(areasTemplate)
}

function addCardsToAppropriateCell() {
    cards.forEach((card)=>{
        addCardToGridCell(card)
    })
}

function createCards() {
    cardObjectDefinitions.forEach((cardItem)=>{
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
    addClassToElement(cardElem, 'card')
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

    // assign class to back image elemnet of back of card
    addClassToElement(cardBackImg, 'card-img')
    
    // assign class to front image elemnet of front of card
    addClassToElement(cardFrontImg, 'card-img')

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

    initializeCardPositions(cardElem) 

    attachClickEventHandlerToCard(cardElem)
}   

function attachClickEventHandlerToCard(card){
    card.addEventListener('click', () => {
        chooseCard(card);
        showCardName(card);
    });
}

function initializeCardPositions(card){
    cardPositions.push(card.id)
}

function createElement(elemType) {
    return document.createElement(elemType)
}

function addClassToElement(elem, className){
    elem.classList.add(className)
}

function addIdToElement(elem, id) {
    elem.id = id
}

function addCardNameToElement(elem, cardName) {
    elem.setAttribute('data-cardname', cardName)
}

function addSrcToImageElem(imgElem, src){
    imgElem.src = src
}

function addChildElement(parentElem, childElem) {
    parentElem.appendChild(childElem)
}


// assesses whether the game is in progress and "places the cards in the correct grid area so to speak"
function addCardToGridCell(card) {
    let cardPositionClassName;

    if (gameInProgress == true && !shufflingInProgress && !cardsRevealed)
    {
        cardPositionClassName = mapCardIdToGridCell(card);
    }
    else
    {
        cardPositionClassName = '.card-pos-a';
    }
    const cardPosElem = document.querySelector(cardPositionClassName)
    addChildElement(cardPosElem, card)
}

function mapCardIdToGridCell(card) {
    if(card.id == 1)
    {
        return '.card-pos-a'
    }
    else if(card.id == 2)
    {
        return '.card-pos-b'
    }
    else if(card.id == 3)
    {
        return '.card-pos-c'
    }
    else if(card.id == 4)
    {
        return '.card-pos-d'
    }
    else if(card.id == 5)
    {
        return '.card-pos-e'
    }
    else if(card.id == 6)
    {
        return '.card-pos-f'
    }
    else if(card.id == 7)
    {
        return '.card-pos-g'
    }
    else if(card.id == 8)
    {
        return '.card-pos-h'
    }
    else if(card.id == 9)
    {
        return '.card-pos-i'
    }
}