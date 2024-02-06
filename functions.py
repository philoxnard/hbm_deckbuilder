import json
import pprint
import ast

from configurations import *

def getCardList():
    """
    Grab the database of cards from db.json.

    Returns a (very large) dictionary
    """

    db = open(DATABASE_FILEPATH)

    cards = json.load(db)

    return cards

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

    print('in generatedeckids')
    print(deckListJSONObj)
    total_quantity = 1

    for card, quantity in deckListJSONObj.items():

        print(card)
        print(quantity)

        int_quantity = int(quantity)

        total_quantity += int_quantity

    deckIDs = []

    for i in range(1, total_quantity):

        ID = i*100
        deckIDs.append(ID)

    print(deckIDs)

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

            print(count)

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
            info_dict["ColorDiffuse"] : {
                "r": 0.713235259,
                "g": 0.713235259,
                "b": 0.713235259  
            }
            info_dict["Locked"] = False
            info_dict["Grid"] = True
            info_dict["Snap"] = True
            info_dict["IgnoreFoW"] = False
            info_dict["Autoraise"] = True
            info_dict["Sticky"] = True
            info_dict["Tooltip"] = True
            info_dict["GridProjection"] = False
            info_dict["HideWhenFaceDown"] = True
            info_dict["Hands"] = False
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
            print(count)
            count += 1

    return contained_objects

def generateFooter(decklistJsonObj):

    decklistJsonObj["TabStates"] = {}
    decklistJsonObj["VersionNumber"] = ""

    return decklistJsonObj