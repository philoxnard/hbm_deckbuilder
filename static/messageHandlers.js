function handleOnLoad(json) {

	// We'll check the browser's version against the server's version. If there's a mismatch,
	// we'll clear localstorage and reload the page to fix any art mismatch issues.
	// If the

	resetFilters()

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

	let decklist = json["decklist"]

	filename = "test.json"

	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(decklist));
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

function handleBuildCrew(json) {

	// json includes "cards" and "crew"
	// cards have a "crew" field, and that field contains a dictionary that looks like:
	//      {"starter": 3}
	// which basically indicates that its quantity in the 'starter' crew is 3.

	// We'll use that dictionary, specifically the ["crew"] field in each card and its accompanying quantity,
	// to add lots of stuff to local storage.

	let cards = json["cards"]
	let crew = json["crew"]

	for(const [name, stats] of Object.entries(cards)) {

		// Get the quantity from the value stored within the crew dict
		let quantity = stats["crew"][crew]

		// Add quantity as a field so it can be picked up by localStorage
		stats["quantity"] = quantity

		let stringified_card = JSON.stringify(stats)

		localStorage.setItem(name, stringified_card)

	location.reload()

	}
}