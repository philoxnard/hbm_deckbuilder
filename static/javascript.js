function loadPage() {

    let message = {}

    message["command"] = "command_on_load"

    send(message)

}

function receive(response) {

    const json = JSON.parse(response)

    command = json["command"]
    result = json["result"]
    console.log(command)
    console.log(result)

    if ( command == "command_on_load" ) {

        handleOnLoad(json)

    } else if ( command == "command_export_decklist" ){

        handleExportDecklist(json)

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

    let stringifiedCard = JSON.stringify(card)

    let loaded_card = loadCardFromLocalStorage(card)
    let card_name = loaded_card["name"]
    let quantity = loaded_card["quantity"]

    if (quantity == null) {
        quantity = 0
    }

    let drawn_card_buttons = "<div class="+card_name+"><button onClick=removeCard('"+stringifiedCard+"')>&#128308</button> "+quantity+" <button onClick=addCard('"+stringifiedCard+"')>&#128994;</button></div>"

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

    let quantity = updated_card["quantity"]
    let name = updated_card["name"]

    updateDrawnQuantity(stringifiedCard, name, quantity)

    drawDeckList()
    
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

    let quantity = updated_card["quantity"]
    let name = updated_card["name"]

    updateDrawnQuantity(stringifiedCard, name, quantity)

    drawDeckList()
}

function updateDrawnQuantity(stringifiedCard, name, quantity) {

    console.log('found')

    console.log(name)
    console.log(quantity)
    $("."+name).html("<div class="+name+"><button onClick=removeCard('"+stringifiedCard+"')>&#128308</button> "+quantity+" <button onClick=addCard('"+stringifiedCard+"')>&#128994;</button></div>")
    console.log('executed')
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

function exportDeckList() {

    let json_decklist = {}

    for ( var i = 0, len = localStorage.length; i < len; ++i ) {
        
        let stringified_card = localStorage.getItem(localStorage.key(i))
        let card = JSON.parse(stringified_card)

        let quantity = card["quantity"]
        let card_name = card["name"]

        if (quantity != 0 && quantity != null && quantity != undefined) {
            
            json_decklist[card_name] = quantity

        }
        
    }

    stringified_decklist = JSON.stringify(json_decklist)

    sendDeckListToServer(stringified_decklist)

}

function sendDeckListToServer(stringifiedDeckList) {

    let message = {}

    let command = "command_export_decklist"

    message["command"] = command
    message["stringified_decklist"] = stringifiedDeckList

    send(message)

}

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

function drawFilters(filters) {

    $("#filters").html("")

    console.log(filters)

    for (const [dropdown_menu, dropdown_option] of Object.entries(filters)) {
        // console.log(`${key} ${value}`); // "a 5", "b 7", "c 9"

        filter_button = "<label for 'mymenu'><button class='filter_button'>top menu</button></label>"
        filter_button += "<select name='mymenu' id='mymenu'>"
        filter_button += "<option value='dropdown'><drowpdown</option>"
        filter_button += "</select>"

        $("#filters").append(filter_button)
    }
}

// {/* <label for="dog-names">Choose a dog name:</label> 
//     <select name="dog-names" id="dog-names"> 
//         <option value="rigatoni">Rigatoni</option> 
//         <option value="dave">Dave</option> 
//         <option value="pumpernickel">Pumpernickel</option> 
//         <option value="reeses">Reeses</option> 
//     </select>
//    */}