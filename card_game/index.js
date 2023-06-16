const cardObjectDefinitions = [
    {id:1, imagePath:'/images/1.jpg'},
    {id:2, imagePath:'/images/2.jpg'},
    {id:3, imagePath:'/images/3.jpg'},
    {id:4, imagePath:'/images/4.jpg'},
]

const cardBackImgPath = '/images/back.jpg'

const cardContainerElem = document.querySelector('.card-container')

let cards = []

const playGameButtonElem = document.getElementById('playGame')

const collapsedGridAreaTemplate = '"a a" "a a"'
const cardCollectionCellClass = ".card-pos-a"

loadGame()

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

}

function startRound() {
    initializeNewRound()
    collectCards()

}

function initializeNewRound() {

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