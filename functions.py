import json

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

    return FILTER_LIST
    