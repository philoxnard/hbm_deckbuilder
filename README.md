


Notes:

card images should be 275px wide
check secret file for git auth code

To Do list:

1) Add full card list to db.json
2) Allow users to filter cards
3) Validate card additions to ensure they're within legal limit
4) DONE!!! Create export button
5) DONE!!! Write code for export button to generate TTS-readable deck list
6) DONE!!! Download TTS-readable deck list to local device
7) Host web app online (Heroku? AWS?)
8) Allow users to empty out their deck list
9) Allow users to name and save their deck lists
10) Make prettier buttons for adding and removing cards
11) Write helpful, user friendly README
12) Add instructions on how to use + save decklist
13) Display how many cards are currently in deck
14) Figure out more elegant way to redraw quantities without re-rendering every image

To make adding cards to the database easier, you're going to make a program that's going to do the following:
1) Ask the user if they want to add a card or edit a card
    2) If add, it asks requests input for the following fields (show some possible answers):
        3) name
        4) card_type
        5) code
        6) pirate_type
        7) power
        8) effect
        9) surprise
        10) restriction
        11) card_art
        12) FaceURL
        13) BackURL
        14) User may enter nothing to skip the field
        15) Store it in db.json, back to step 1
    2) If edit, it asks the user for the card_name
        3) Then displays all of the fields for that card
        4) Asks user to input which field they want to change
        5) Asks user to input what they want to change that field to
        6) Store it in db.json, bcak to step 1
