function loadPage() {

    let message = {}

    message["command"] = "command_on_load"

    // localStorage.removeItem('undefined')
    // localStorage.removeItem('cannon_boo')
    // localStorage.removeItem('cannon_bully')

    send(message)


function send(message) {

    fetch("/receive", { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json'
        }, 

        body: JSON.stringify({data: message})

      }) 
      .then(response => response.text()) 
      .then(result => { 

        receive(result)

      }) 
      .catch(error => { 
        console.error('Error:', error); 
      }); 
}

}

function receive(response) {

    const json = JSON.parse(response)

    command = json["command"]
    result = json["result"]
    console.log(command)
    console.log(result)

    if ( command == "command_on_load" ) {

        handleOnLoad(json)

    }

}

function drawCard(card) {

    let image = card["card_art"]
    let name = card["name"]

    let drawn_card = '<div class="card"><img src ="' + image + '" alt="' + name + '">'
    let drawn_card_buttons = drawCardButtons(card)
    let drawn_card_final = drawn_card + drawn_card_buttons

    return drawn_card_final

}


function drawCardButtons(card) {

    let strigified_card = JSON.stringify(card)

    let loaded_card = loadCardFromLocalStorage(card)
    let quantity = loaded_card["quantity"]

    if (quantity == null) {
        quantity = 0
    }

    let drawn_card_buttons = "<button onClick=removeCard('"+strigified_card+"')>&#128308</button> "+quantity+" <button onClick=addCard('"+strigified_card+"')>&#128994;</button>"

    let drawn_card_buttons_final = drawn_card_buttons + "</div>"

    return drawn_card_buttons_final

}

function addCard(stringifiedCard){
    /// This function is called when the user clicks the add card button.
    /// It accepts a stringified version of a card object as an argument.
    /// It then unpacks that string, uses information from the string to
    /// load the accompanying localStorage object (or create one), then
    /// updates the quantity, and put it back in localStorage.

    parsed_card = JSON.parse(stringifiedCard)

    let stored_card = loadCardFromLocalStorage(parsed_card)

    updated_card = increaseQuantity(stored_card)

    storeCardInLocalStorage(updated_card)

    loadPage()
    
}

function removeCard(stringifiedCard){
    /// This function is called when the user clicks the remove card button.
    /// It accepts a stringified version of a card object as an argument.
    /// It then unpacks that string, uses information from the string to
    /// load the accompanying localStorage object, then updates the quantity,
    /// and put it back in localStorage.

    let card = JSON.parse(stringifiedCard)

    let stored_card = loadCardFromLocalStorage(card)

    updated_card = decreaseQuantity(stored_card)

    storeCardInLocalStorage(updated_card)

    loadPage()
}

function drawDeckList() {

    $(".content_left").html("")
    for ( var i = 0, len = localStorage.length; i < len; ++i ) {
        
        let card_name = localStorage.key(i)
        let stringified_card = localStorage.getItem(localStorage.key(i))
        let card = JSON.parse(stringified_card)
        let quantity = card["quantity"]

        if (quantity != 0) {
            let drawn_card = drawCard(card)
            $(".content_left").append(drawn_card)
        }
        
      }

}

function drawCardDB(cards) {

    $(".content_right").html("")

    for(const [name, stats] of Object.entries(cards)) {

        drawn_card = drawCard(stats)
        $(".content_right").append(drawn_card)
        
    }
    
}

function storeCardInLocalStorage(card) {
    /// This function takes a card written as a JSON object and stores it
    /// in localStorage as a string (indexed by the card name)

    if ( card == null || card == undefined) {
        return
    }

    card_name = card["name"]
    stringified_card = JSON.stringify(card)

    localStorage.setItem(card_name, stringified_card)

}

function loadCardFromLocalStorage(cardObj) {
    /// This function takes a card written as a JSON object and loads the
    /// matching object stored in localStorage

    let card

    card_name = cardObj["name"]
    stringified_card = localStorage.getItem(card_name)
    
    // If we have something stored, then we return it. If not, then
    // we just return the original card (which won't hvae a quantity)
    if (stringified_card != null) {
        return JSON.parse(stringified_card)
    } else {
        return cardObj
    }

}

function increaseQuantity(storedCard) {
    // This function increases the quantity of the stored card by 1.
    // It must also check to see if the stored card exists, or
    // if the stored card has 0 quantity.

    // Function accepts a card object and returns that same card
    // object with an updated quantity

    // If the stored card doesn't exist, we just make it and set quantity to 0

    let quantity

    if (storedCard["quantity"] == null) {
        quantity = 0
    } else {

        quantity = storedCard["quantity"]
    }

    let new_quantity = parseInt(quantity) + 1

    storedCard["quantity"] = new_quantity

    return storedCard

}

function decreaseQuantity(storedCard) {
    // This function decreases the quantity of the stored card by 1.
    // It must also check to see if the stored card exists, if the quantity
    // exists, or if the quantity is 0.

    if (storedCard == null ) {

        return

    } else {

        quantity = storedCard["quantity"]

        if (quantity == null || quantity == 0) {

            return

        }
    }

    let new_quantity = parseInt(quantity) - 1

    storedCard["quantity"] = new_quantity 

    return storedCard
}