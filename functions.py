import json
import pprint
import ast

from configurations import *

def getCardList(filters=None):
    """
    Grab the database of cards from db.json.

    Returns a (very large) dictionary
    """

    db = open(DATABASE_FILEPATH)

    cards = json.load(db)

    if filters != None:

        cards = filterCards(cards, filters)

    # NOTE: In order to display stuff on the GUI, we need to remove effect text from the card
    #       object because its just too long - because we basically store the whole card
    #       as text within the div id, we can't make it absurdly long.
    cards_no_effect_text = {}
    for card_name, card_info in cards.items():
        del card_info["effect_text"]
        cards_no_effect_text[card_name] = card_info
    
    return cards_no_effect_text

def getFilters():

    return FILTER_DICT
    
def generateHeader(decklistJsonObj):

    decklistJsonObj['SaveName'] = ''
    decklistJsonObj["GameMode"] = ""
    decklistJsonObj["Gravity"] = 0.5
    decklistJsonObj["PlayArea"] = 0.5
    decklistJsonObj["Date"] = ""
    decklistJsonObj["Table"] = ""
    decklistJsonObj["Sky"] = ""
    decklistJsonObj["Note"] = ""
    decklistJsonObj["Rules"] = ""
    decklistJsonObj["XmlUI"] = ""
    decklistJsonObj["LuaScript"] = ""
    decklistJsonObj["LuaScriptState"] = ""

    return decklistJsonObj

def generateObjectStates(decklistJsonObj, deckListFromFrontEnd):

    object_states = []
    dict_1 = {}

    transform_dict = {
        "posX": 0.1779872,
        "posY": 3.08887124,
        "posZ": 0.29411754,
        "rotX": 358.469971,
        "rotY": 179.966263,
        "rotZ": 1.77417183,
        "scaleX": 1.0,
        "scaleY": 1.0,
        "scaleZ": 1.0
    }

    dict_1["Name"] = "Deck"
    dict_1["Transform"] = transform_dict
    dict_1["Nickname"] = ""
    dict_1["Description"] = ""
    dict_1["GMNotes"] = ""
    dict_1["ColorDiffuse"] = {  "r": 0.713235259,
                                "g": 0.713235259,
                                "b": 0.713235259
                            }
    dict_1["Locked"] = False
    dict_1["Grid"] = True
    dict_1["Snap"] = True
    dict_1["IgnoreFoW"] = False
    dict_1["Autoraise"] = True
    dict_1["Sticky"] = True
    dict_1["Tooltip"] = True
    dict_1["GridProjection"] = False
    dict_1["HideWhenFaceDown"] = True
    dict_1["Hands"] = False
    dict_1["SidewaysCard"] = False

    deck_ids = generateDeckIDs(deckListFromFrontEnd)

    dict_1["DeckIDs"] = deck_ids

    custom_deck = generateCustomDeck(deckListFromFrontEnd)

    dict_1["CustomDeck"] = custom_deck
    dict_1["XmlUI"] = ""
    dict_1["LuaScript"] = ""

    contained_objects = generateContainedObjects(deckListFromFrontEnd)

    dict_1["ContainedObjects"] = contained_objects

    dict_1["GUID"] = "2fc847"

    object_states.append(dict_1)

    decklistJsonObj["ObjectStates"] = object_states

    return decklistJsonObj

def generateDeckIDs(deckListJSONObj):
    """
    This function will spit out a list [100, 200, 300, etc] for each
    card in the deck. It's important that this is flexible so users
    can build 50 or 65 card decks.
    """

    total_quantity = 1

    for card, quantity in deckListJSONObj.items():

        int_quantity = int(quantity)

        total_quantity += int_quantity

    deckIDs = []

    for i in range(1, total_quantity):

        ID = i*100
        deckIDs.append(ID)

    return deckIDs

def generateCustomDeck(deckListJSONObj):
    """
    This takes the decklist json obj and returns a dictionary full
    of dictionaries that looks like this:

    { "1" : 
        "FaceURL": "https://cards.scryfall.io/normal/front/0/8/0826bec4-1958-4b5a-89be-70a4801e2384.jpg?1706240336",
        "BackURL": "https://backs.scryfall.io/normal/0/a/0aeebaf5-8c7d-4636-9e82-8c27447861f7.jpg",
        "NumWidth": 1,
        "NumHeight": 1,
        "BackIsHidden": true,
        "UniqueBack": false
    }

    To do this, we need to read from db.json
    """

    card_db_raw = open(DATABASE_FILEPATH)
    card_db = json.load(card_db_raw)

    custom_deck = {}
    count = 1

    for card_name, quantity in deckListJSONObj.items():

        for i in range(quantity):

            card_in_db = card_db[card_name]

            FaceURL = card_in_db["FaceURL"]
            BackURL = card_in_db["BackURL"]

            info_dict = {}
            info_dict["FaceURL"] = FaceURL
            info_dict["BackURL"] = BackURL
            info_dict["NumWidth"] = 1
            info_dict["NumHeight"] = 1
            info_dict["BackIsHidden"] = True
            info_dict["UniqueBack"] = False

            custom_deck[str(count)] = info_dict

            count += 1

    return custom_deck

def generateContainedObjects(deckListJSONObj):
    """
    This returns a list.
    The list is comprised of dictionaries that look like this:


{
        "Name": "CardCustom",
        "Transform": {
        "posX": 0.5254047,
        "posY": 1.21068287,
        "posZ": 0.19025977,
        "rotX": -0.0008576067,
        "rotY": 180.000061,
        "rotZ": 179.9986,
        "scaleX": 1.0,
        "scaleY": 1.0,
        "scaleZ": 1.0
        },
        "Nickname": "Mountain",
        "Description": "",
        "GMNotes": "",
        "ColorDiffuse": {
        "r": 0.713235259,
        "g": 0.713235259,
        "b": 0.713235259
        },
        "Locked": false,
        "Grid": true,
        "Snap": true,
        "IgnoreFoW": false,
        "Autoraise": true,
        "Sticky": true,
        "Tooltip": true,
        "GridProjection": false,
        "HideWhenFaceDown": true,
        "Hands": true,
        "CardID": 100,
        "SidewaysCard": false,
        "CustomDeck": {
        "1": {
        "FaceURL": "https://cards.scryfall.io/normal/front/0/8/0826bec4-1958-4b5a-89be-70a4801e2384.jpg?1706240336",
        "BackURL": "https://backs.scryfall.io/normal/0/a/0aeebaf5-8c7d-4636-9e82-8c27447861f7.jpg",
        "NumWidth": 1,
        "NumHeight": 1,
        "BackIsHidden": true,
        "UniqueBack": false
        }
        },
        "XmlUI": "",
        "LuaScript": "",
        "LuaScriptState": ""
        }

    """

    card_db_raw = open(DATABASE_FILEPATH)
    card_db = json.load(card_db_raw)

    contained_objects = []
    count = 1

    for card_name, quantity in deckListJSONObj.items():

        for i in range(quantity):

            card_in_db = card_db[card_name]

            nickname = card_in_db["name"]
            FaceURL = card_in_db["FaceURL"]
            BackURL = card_in_db["BackURL"]

            info_dict = {}
            info_dict["Name"] = "CardCustom"
            info_dict["Transform"] = {
                "posX": 0.5254047,
                "posY": 1.21068287,
                "posZ": 0.19025977,
                "rotX": -0.0008576067,
                "rotY": 180.000061,
                "rotZ": 179.9986,
                "scaleX": 1.0,
                "scaleY": 1.0,
                "scaleZ": 1.0
            }
            info_dict["Nickname"] = nickname
            info_dict["Description"] = ""
            info_dict["GMNotes"] = ""
            info_dict["ColorDiffuse"] = {"r": 0.713235259, "g": 0.713235259,"b": 0.713235259}
            info_dict["Locked"] = False
            info_dict["Grid"] = True
            info_dict["Snap"] = True
            info_dict["IgnoreFoW"] = False
            info_dict["Autoraise"] = True
            info_dict["Sticky"] = True
            info_dict["Tooltip"] = True
            info_dict["GridProjection"] = False
            info_dict["HideWhenFaceDown"] = True
            info_dict["Hands"] = True
            info_dict["CardID"] = count*100
            info_dict["SidewaysCard"] = False

            custom_deck = {}
            custom_deck_info_dict = {}

            custom_deck_info_dict["FaceURL"] = FaceURL
            custom_deck_info_dict["BackURL"] = BackURL
            custom_deck_info_dict["NumWidth"] = 1
            custom_deck_info_dict["NumHeight"] = 1
            custom_deck_info_dict["BackIsHidden"] = True
            custom_deck_info_dict["UniqueBack"] = False


            custom_deck[str(count)] = custom_deck_info_dict
            info_dict["CustomDeck"] = custom_deck

            info_dict["XmlUI"] = ""
            info_dict["LuaScript"] = ""
            info_dict["LuaScriptState"] = ""

            contained_objects.append(info_dict)

            count += 1

    return contained_objects

def generateFooter(decklistJsonObj):

    decklistJsonObj["TabStates"] = {}
    decklistJsonObj["VersionNumber"] = ""

    return decklistJsonObj

def repackageRawFilters(rawFilters):
    """
    Repackage the incoming raw filters and make them pretty and readable.
    For reference on what keys/values may be present in rawFilters, check
    the docstring for handleFilterCards().
    """

    filters = {}
    card_type = ""
    pirate_code = ""
    pirate_types = [""]
    crew = None
    effect_text = ""
    firepower = None
    firepower_relativity = None

    # In case we ever decide to filter inclusively, I'll leave this here
    # if "show_boom" in rawFilters:
    #     pirate_codes.append('boom')
    # if "show_deep_sea" in rawFilters:
    #     pirate_codes.append('deep_sea')
    # if "show_heavy_metal" in rawFilters:
    #     pirate_codes.append('heavy_metal')
    # if "show_tropical" in rawFilters:
    #     pirate_codes.append('tropical')
    # if "show_juju" in rawFilters:
    #     pirate_codes.append('juju')

    if "card_type" in rawFilters:
        card_type = rawFilters["card_type"]

    if "pirate_code" in rawFilters:
        pirate_code = rawFilters["pirate_code"]

    if "pirate_type" in rawFilters:
        pirate_types_no_spaces = rawFilters["pirate_type"].replace(" ", "")
        pirate_types_lowercase = pirate_types_no_spaces.lower()
        pirate_types = pirate_types_lowercase.split(",")

    if "effect_text" in rawFilters:
        effect_text = rawFilters["effect_text"]

    if "firepower" in rawFilters:
        try:
            firepower = int(rawFilters["firepower"])
        except:
            print("Firepower not an integer")

    if "firepower_relativity" in rawFilters:

        firepower_relativity = rawFilters["firepower_relativity"]

    if "crew" in rawFilters:

        if rawFilters["crew"] != "None":

            crew = rawFilters["crew"]

    filters["card_type"] = card_type
    filters["pirate_code"] = pirate_code
    filters["pirate_types"] = pirate_types
    filters["effect_text"] = effect_text
    filters["firepower"] = firepower
    filters["firepower_relativity"] = firepower_relativity
    filters["crew"] = crew

    return filters

def filterCards(cards, filters):
    """
    This function uses the filters to only pluck out the cards that satisfy the filters
    and returning that json object.

    It creates a copy of all of the cards, them removes anything from the copy that doesn't pass the filter(s)

    """

    filtered_cards = cards.copy()

    for card_name, card_info in cards.items():

        if filters["card_type"] != "":

            if card_info["card_type"] != filters["card_type"]:

                if card_name in filtered_cards:

                    del filtered_cards[card_name]

        if filters["pirate_code"] != "":

            if "pirate_code" not in card_info or card_info["pirate_code"] != filters["pirate_code"]:

                if card_name in filtered_cards:

                    del filtered_cards[card_name]

        if filters["effect_text"] != "":

            # When we compare the text that the user submitted against the name of pirates, we need to replace all the spaces with underscores

            raw_searched_name = filters["effect_text"].lower()
            edited_searched_name = raw_searched_name.replace( " ", "_" )

            if filters["effect_text"].lower() not in card_info["effect_text"].lower() and edited_searched_name not in card_info["name"]:

                if card_name in filtered_cards:

                    del filtered_cards[card_name]

        # Some cards are experimental and are not to be publicly known. These cards will be automatically removed
        # from the general fetch unless the "experimental" type is specifically searched for
        if "experimental" not in filters["pirate_types"]:

            if "pirate_types" in card_info and "experimental" in card_info["pirate_types"]:

                del filtered_cards[card_name]

        if filters["pirate_types"] != [""]:

            type_1 = filters["pirate_types"][0]

            if "pirate_types" not in card_info or type_1 not in card_info["pirate_types"]:

                if card_name in filtered_cards:

                    del filtered_cards[card_name]

            if len(filters["pirate_types"]) > 1:

                type_2 = filters["pirate_types"][1]

                if type_2 not in card_info["pirate_types"]:

                    if card_name in filtered_cards:

                        del filtered_cards[card_name]

        if filters["firepower"] != None:

            if "firepower" not in card_info:

                    if card_name in filtered_cards:

                        del filtered_cards[card_name]

            else:

                if card_info["firepower"] == "X":

                    card_info["firepower"] = "0"

                card_info["firepower"] = int(card_info["firepower"])

                if filters["firepower_relativity"] == "firepower_equal":

                    if card_info["firepower"] != filters["firepower"]:

                        if card_name in filtered_cards:

                            del filtered_cards[card_name]

                elif filters["firepower_relativity"] == "firepower_lower":

                    if card_info["firepower"] >= filters["firepower"]:

                        if card_name in filtered_cards:

                            del filtered_cards[card_name]

                elif filters["firepower_relativity"] == "firepower_higher":

                    if card_info["firepower"] <= filters["firepower"]:

                        if card_name in filtered_cards:

                            del filtered_cards[card_name]

        if filters["crew"] != None:

            if "crew" not in card_info:

                if card_name in filtered_cards:

                    del filtered_cards[card_name]

            else:

                for crew in card_info["crew"]:

                    if crew != filters["crew"]:

                        if card_name in filtered_cards:

                            del filtered_cards[card_name]

    return filtered_cards