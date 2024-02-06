function handleOnLoad(json) {

    let cards = json["cards"]
    
    $(".content_left").html("")

    drawDeckList()
    drawCardDB(cards)

}