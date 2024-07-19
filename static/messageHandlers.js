function handleOnLoad(json) {

    // We'll check the browser's version against the server's version. If there's a mismatch,
    // we'll clear localstorage and reload the page to fix any art mismatch issues.
    // If the

    let browser_version = localStorage.getItem("version")
    if ( browser_version == null || browser_version != json["version"] ) {

        localStorage.clear()
        localStorage.version = json["version"]
        location.reload()
        return
    }

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