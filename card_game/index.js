const cardObjectDefinitions = [
    {id:1, imagePath:'/images/1.jpg'},
    {id:2, imagePath:'/images/2.jpg'},
    {id:3, imagePath:'/images/3.jpg'},
    {id:4, imagePath:'/images/4.jpg'},
]

const acedId = 1

const cardBackImgPath = '/images/back.jpg'

const cardContainerElem = document.querySelector('.card-container')

let cards = []

const playGameButtonElem = document.getElementById('playGame')

const collapsedGridAreaTemplate = '"a a" "a a"'
const cardCollectionCellClass = ".card-pos-a"

const numCards = cardObjectDefinitions.length

let cardPositions = []

let gameInProgress = false
let shufflingInProgress = false
let cardsRevealed = false

const currentGameStatusElem = document.querySelector('.current-status')

const scoreContainerElem = document.querySelector('.header-score-container')
const scoreElem = document.querySelector('.score')

const roundContainerElem = document.querySelector('.header-round-container')
const roundElem = document.querySelector('.round')

const winColor = "green"
const loseColor = "red"
const primaryColor = "black"

let roundNum = 0
let maxRounds = 4
let score = 0

loadGame()

function chooseCard(card) {
    if(canChooseCard())
    {
        evaluateCardChoice(card)
        flipCard(card, false)
        setTimeout(() => {
            flipCards(false)
            updateStatusElement(currentGameStatusElem, "block", primaryColor, "card positions revealed")
        }, 1000)
        cardsRevealed = true
    }

}

// this won't be necessary
function calculateScoreToAdd(roundNum) {
    if(roundNum == 1)
    {
        return 100
    }
    else if(roundNum == 2)
    {
        return 50
    }
    else if(roundNum == 3)
    {
        return 25
    }
    else
    {
        return 10
    }
}

// this won't be necessary
function calculateScore(){
    const scoreToAdd = calculateScoreToAdd(roundNum)
    score = score + scoreToAdd
}

// this will eventually be a function that tells chatgpt what cards have been drawn
function updateScore() {
    calculateScore()

}

function updateStatusElement(elem, display, color, innerHTML) {
    elem.style.display = display
    if(arguments.length > 2)
    {
        elem.style.color = color
        elem.innerHTML = innerHTML
    }

}

function outputChoiceFeedback(hit) {
    if(hit)
    {
        updateStatusElement(currentGameStatusElem, "block", winColor, "Hit! Well Done :)")
    }
    else
    {
        updateStatusElement(currentGameStatusElem, "block", loseColor, "Missed :(")
    }
}

// evaluates and outputs whether selected card is the ace (star); and updates score
// this will probably be deleted further on as not necessary for tarot reading, tbd
function evaluateCardChoice(card) {
    if(card.id == acedId)
    {
        updateScore()
        outputChoiceFeedback(true)
    }
    else
    {
        outputChoiceFeedback(false)
    }

}

function canChooseCard() {
    return gameInProgress == true && !shufflingInProgress && !cardsRevealed
}

function loadGame(){
    createCards()
    cards = document.querySelectorAll('.card')
    playGameButtonElem.addEventListener('click', ()=>startGame())
}

function startGame(){
    initializeNewGame()
    startRound()
}

function initializeNewGame() {
    score = 0 
    roundNum = 0 
    shufflingInProgress = false

    updateStatusElement(scoreContainerElem, "flex")
    updateStatusElement(roundContainerElem, "flex")

    updateStatusElement(scoreElem, "block", primaryColor, `Score <span class='badge'>${score}</span>`)

    updateStatusElement(roundElem, "block", primaryColor, `Round <span class='badge'>${roundNum}</span>`)
   
}

function startRound() {
    initializeNewRound()
    collectCards()
    flipCards(true)
    shuffleCards()

}

// sthis will probably eventually be initialize new reading
function initializeNewRound() {
    roundNum++
    playGameButtonElem.disabled = true
    gameInProgress = true
    shufflingInProgress = true
    cardsRevealed = false

    updateStatusElement(currentGameStatusElem, "block", primaryColor, "Shuffling... shuffling")
    updateStatusElement(roundElem, "block", primaryColor, `Round <span class='badge'>${roundNum}</span>`)


}

function collectCards() {
    transformGridArea(collapsedGridAreaTemplate)
    addCardsToGridAreaCell(cardCollectionCellClass)

}

function transformGridArea(areas) {
    cardContainerElem.style.gridTemplateAreas = areas

}

function addCardsToGridAreaCell(cellPositionClassName) {
    const cellPositionElem = document.querySelector(cellPositionClassName)
    cards.forEach((card, index) => {
        addChildElement(cellPositionElem, card)
    }

    )
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

function shuffleCards() {
    const id = setInterval(shuffle, 12)
    let shuffleCount = 0 
    function shuffle() {
        randomizeCardPositions()

        if(shuffleCount == 250)
        {
            clearInterval(id)
            shufflingInProgress = false
            dealCards()
            updateStatusElement(currentGameStatusElem, "block", primaryColor, "Please choose the card you think is the star")
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
    const areasTemplate = returnGridAreasMappedToCardPos()
    transformGridArea(areasTemplate)


}

function returnGridAreasMappedToCardPos()
{
    let firstPart = ""
    let secondPart = ""
    let areas = ""

    cards.forEach((card, index) => {
        if(cardPositions[index] == 1)
        {
            areas = areas + "a "
        }
        else if(cardPositions[index] == 2)
        {
            areas = areas + "b "
        }
        else if (cardPositions[index] == 3)
        {
            areas = areas + "c "
        }
        else if (cardPositions[index] == 4)
        {
            areas = areas + "d "
        }
        if (index == 1)
        {
            firstPart = areas.substring(0, areas.length - 1)
            areas = "";
        }
        else if (index == 3)
        {
            secondPart = areas.substring(0, areas.length - 1)
        }

    })

    return `"${firstPart}" "${secondPart}"`


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

    // add class to inner card elemet
    addClassToElement(cardInnerElem, 'card-inner')

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
    card.addEventListener('click', () => chooseCard(card))
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

function addSrcToImageElem(imgElem, src){
    imgElem.src = src
}

function addChildElement(parentElem, childElem) {
    parentElem.appendChild(childElem)
}

function addCardToGridCell(card) {
    const cardPositionClassName = mapCardIdToGridCell(card)
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


}