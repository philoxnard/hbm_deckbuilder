This is what you need to do:

1) Display the list of (currently dummy) cards on the right side of screen
2) Put little plus/minus boxes beneath each card
3) Create list on left side of screen that gets adjusted when the plus/minus boxes are hit
4) Generate a text/json string from the user's selected deck and make a deck with it

Eventually:

1) Fill db.json with entire database
2) Validate decks to ensure they're legal
3) Make display nice

NOTE: When the user filters by X or Y, we don't CHANGE the card list - we just change what the front end requests from the back end. If they filter by Juju pirates, then the front end will only ask the back end for Juju pirates with which to populate the card list window

get this shit on github yo

card images should be 275px wide