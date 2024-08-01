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

    } else if ( command == "command_filter_cards" ) {

        handleFilterCards(json)

    } else if ( command == "command_build_crew" ) {

        handleBuildCrew(json)

    }

}

function drawCard(card) {

    let image = card["FaceURL"]
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

    $("."+name).html("<div class="+name+"><button onClick=removeCard('"+stringifiedCard+"')>&#128308</button> "+quantity+" <button onClick=addCard('"+stringifiedCard+"')>&#128994;</button></div>")

}

function drawDeckList() {

    $(".content_left").html("")
    let total_quantity = 0
    for ( var i = 0, len = localStorage.length; i < len; ++i ) {

        // Because we're dumb, there could be a 'version' key here. if so, we want to skip over it

        if ( localStorage.key(i) == "version" ) {
            continue
        }

        let card_name = localStorage.key(i)
        let stringified_card = localStorage.getItem(localStorage.key(i))
        let card = JSON.parse(stringified_card)
        let quantity = card["quantity"]

        if (quantity != 0) {
            let drawn_card = drawCard(card)
            $(".content_left").append(drawn_card)

            total_quantity += quantity

        }

      }

    $("#total_quantity").html(total_quantity)
      console.log('total quantity')
      console.log(total_quantity)
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

function showFilterModal() {

    $("#filter_modal").show()

}

function resetDeckList() {

    for ( var i = 0, len = localStorage.length; i < len; ++i ) {
        
        let stringified_card = localStorage.getItem(localStorage.key(i))

        // This basically ignores any non-card things that happen to be there - such as version.
        if (stringified_card.includes("FaceURL") == false) {
            continue
        }
        let card = JSON.parse(stringified_card)

        let quantity = card["quantity"]
        let name = card["name"]

        if (quantity != 0 && quantity != null && quantity != undefined) {
            
            card["quantity"] = 0

            storeCardInLocalStorage(card)

            updateDrawnQuantity(stringified_card, name, card["quantity"])

        }
    }

    drawDeckList()

}

function submitFilters() {
    /// This function needs to package all of the information held in the filter modal.
    /// Then it needs to send all of the information to the server

    let json_message = {}

    // In case we ever make it an inclusive filter, I'll leave this here
    // if ( $( boom_checkbox ).is( ":checked" ) ) {
    //     json_message["show_boom"] = true
    // }
    // if ( $( deep_sea_checkbox ).is( ":checked" ) ) {
    //     json_message["show_deep_sea"] = true
    // }
    // if ( $( heavy_metal_checkbox ).is( ":checked" ) ) {
    //     json_message["show_heavy_metal"] = true
    // }
    // if ( $( tropical_checkbox ).is( ":checked" ) ) {
    //     json_message["show_tropical"] = true
    // }
    // if ( $( juju_checkbox ).is( ":checked" ) ) {
    //     json_message["show_juju"] = true
    // }

    json_message["card_type"] = $('input[name="card_type"]:checked').val()
    json_message["pirate_code"] = $('input[name="pirate_code"]:checked').val()
    json_message["pirate_type"] = $("#pirate_type_input").val()
    json_message["effect_text"] = $("#effect_text").val()
    json_message["firepower"] = $("#firepower_filter").val()
    json_message["firepower_relativity"] = $('input[name="firepower"]:checked').val()
    json_message["crew"] = $("#crew_filter").val()

    console.log(json_message)
    sendFilterListToServer(json_message)

}

function resetFilters() {


    $(".pirate_code_radio").prop('checked', false)
    $(".card_type_radio").prop('checked', false)
    $("#pirate_type_input").val("")
    $("#effect_text").val("")
    $("#firepower_filter").val("")
    $("#crew_filter").val("None")

    submitFilters()

}

function buildCrew() {

    let message = {}

    let command = "command_build_crew"

    let crew = $("#build_crew").val()

    message["command"] = command
    message["crew"] = crew

    send(message)
}

function exportDeckList() {

    let json_decklist = {}

    for ( var i = 0, len = localStorage.length; i < len; ++i ) {
        
        let stringified_card = localStorage.getItem(localStorage.key(i))

        // skip over random fields in localstorage such as version
        if ( stringified_card.includes("FaceURL") == false ) {
            continue
        }
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

function sendFilterListToServer(filters) {

    let message = {}

    let command = "command_filter_cards"

    message["command"] = command
    message["filters"] = filters

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

    // This stuff is all going ot be inside the filter_modal div
    // There will be checkboxes for the different pirate codes
    // A text box where they can input type (separated by commas)
    // A text box where they can input keywords
    // A text box where they can input firepower AND radio buttons for under, equal, and over
    // That's good for now, maybe eventually you can add more

    $("#filter_modal").html("")

    $("#filter_modal").append("<div class='filter_modal_column' id='filter_modal_column_1'>")

    $("#filter_modal_column_1").append("Display only pirates from this pirate code:<br>")

    // Can keep these in case we decide to filter inclusively
    // $("#filter_modal_column_1").append('<input class="code_checkbox" type="checkbox" id="juju_checkbox" name="juju" value="juju"><label for="juju">Juju</label><br>')
    // $("#filter_modal_column_1").append('<input class="code_checkbox" type="checkbox" id="deep_sea_checkbox" name="deep_sea" value="deep_sea"><label for="deep_sea">Deep Sea</label><br>')
    // $("#filter_modal_column_1").append('<input class="code_checkbox" type="checkbox" id="heavy_metal_checkbox" name="heavy_metal" value="heavy_metal"><label for="heavy_metal">Heavy Metal</label><br>')
    // $("#filter_modal_column_1").append('<input class="code_checkbox" type="checkbox" id="tropical_checkbox" name="tropical" value="tropical"><label for="tropical">Tropical</label><br>')
    // $("#filter_modal_column_1").append('<input class="code_checkbox" type="checkbox" id="boom_checkbox" name="boom" value="boom"><label for="boom">Boom</label><br>')

    $("#filter_modal_column_1").append('<input class="pirate_code_radio" type="radio" id="boom" name="pirate_code" value="boom"><label for="boom">Boom</label><br>')
    $("#filter_modal_column_1").append('<input class="pirate_code_radio" type="radio" id="juju" name="pirate_code" value="juju"><label for="juju">Juju</label><br>')
    $("#filter_modal_column_1").append('<input class="pirate_code_radio" type="radio" id="tropical" name="pirate_code" value="tropical"><label for="tropical">Tropical</label><br>')
    $("#filter_modal_column_1").append('<input class="pirate_code_radio" type="radio" id="heavy_metal" name="pirate_code" value="heavy_metal"><label for="heavy_metal">Heavy Metal</label><br>')
    $("#filter_modal_column_1").append('<input class="pirate_code_radio" type="radio" id="deep_sea" name="pirate_code" value="deep_sea"><label for="deep_sea">Deep Sea</label><br><br>')

    $("#filter_modal_column_1").append("Display pirates with this type combination (separated by commas):<br>")
    $("#filter_modal_column_1").append("<input type='text' id='pirate_type_input' name='pirate_type_input'>")

    $("#filter_modal_column_1").append("<br><p><button onclick='resetFilters()'>Reset Filters</button></p>")
   
    $("#filter_modal_column_1").append('</div>')

    $("#filter_modal").append("<div class='filter_modal_column' id='filter_modal_column_2'>")

    $("#filter_modal_column_2").append('Display which card type:<br>')
    $("#filter_modal_column_2").append('<input class="card_type_radio" type="radio" id="pirate" name="card_type" value="pirate"><label for="pirate">Pirate</label><br>')
    $("#filter_modal_column_2").append('<input class="card_type_radio" type="radio" id="ship" name="card_type" value="ship"><label for="ship">Ship</label><br>')
    $("#filter_modal_column_2").append('<input class="card_type_radio" type="radio" id="shanty" name="card_type" value="shanty"><label for="shanty">Shanty</label><br>')


    $("#filter_modal_column_2").append('Input effect text to filter by:<br>')
    $("#filter_modal_column_2").append("<input type='text' id='effect_text' name='effect_text'><br><br>")

    $("#filter_modal_column_2").append('Input firepower to display:<br>')
    $("#filter_modal_column_2").append('<input type="radio" id="firepower_higher" name="firepower" value="firepower_higher"><label for="firepower_higher">Firepower higher than</label><br>')
    $("#filter_modal_column_2").append('<input type="radio" id="firepower_equal" name="firepower" value="firepower_equal" checked="checked"><label for="firepower_equal">Firepower equal to</label><br>')
    $("#filter_modal_column_2").append('<input type="radio" id="firepower_lower" name="firepower" value="firepower_lower"><label for="firepower_lower">Firepower lower than</label><br>')
    $("#filter_modal_column_2").append("<input type='text' id='firepower_filter' name='firepower_filter'><br><br>")

    $("#filter_modal_column_2").append('Input crew to display:<br>')
    $("#filter_modal_column_2").append("<select name='crew_filter' id='crew_filter'><option value='None'>None</option><option value='starter_ships'>Starter Ships</option><option value='starter'>Starter</option><option value='fearless'>Fearless</option><option value='clever'>Clever</option><option value='mystical'>Mystical</option></select>")

    $("#filter_modal_column_2").append("<button id='filter_button' onclick='submitFilters()'>Filter Cards</button>")

    $("#filter_modal_column_2").append('</div>')

}

// Copy/pasted this from stackoverflow, works like a charm
$(document).mouseup(function(e) 
{
    var container = $("#filter_modal");

    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target) && container.has(e.target).length === 0) 
    {
        container.hide();
    }
});