function handleOnLoad(json) {

    let cards = json["cards"]
    let filters = json["filters"]

    drawFilters(filters)
    drawDeckList()
    drawCardDB(cards)

}

function handleExportDecklist(json) {

    let tts_decklist = json["tts_decklist"]

    filename = "test.json"

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(tts_decklist));
    element.setAttribute('download', filename);
    
    element.style.display = 'none';
    document.body.appendChild(element);
    
    element.click();
    
    document.body.removeChild(element);

}

function handleFilterCards(json) {

    cards = json["cards"]

    drawCardDB(cards)
}