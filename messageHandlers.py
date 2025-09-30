
from functions import *

def handleOnLoad(message):
    """
    When the page is first loaded, it needs to grab the following things from
    the back end in order to display the front properly:

    1) The full list of available cards
    2) The list of filters

    I may eventually decide to have even more stuff done server-side, but that
    should be plenty for now
    """

    response = {}

    cards = getCardList()

    filters = getFilters()

    response["cards"] = cards
    response["filters"] = filters
    response["version"] = "2.3.4"
    response["result"] = "Success"

    return response

def handleExportDecklist(message):
    """
    This function is called when the user hits the Export button. It will
    contain a key called "stringified_decklist", which is a long stringified
    JSON object full of key/value pairs such as {} "cannon_boo" : 2 } which
    denotes what cards are to be added to the decklist and in what quantity.

    It will also contain a key called "export_type" which will either be "json"
    or "text". For json, we export a big nasty json string for TTS to ingest. For text,
    we export a simple plain text version

    This function will take that information and use it to go through db.json
    and add the appropriate cards/quantities to the decklist. 

    See sample_decklist.json to see what the ultimate output of this function
    should look like.
    """

    response = {}

    stringified_decklist = message["stringified_decklist"]
    decklist_from_front_end = json.loads(stringified_decklist)

    export_type = message["export_type"]

    if export_type == "json":

        decklist_json_obj = {}

        tts_decklist = generateTTSDeckList(decklist_json_obj, decklist_from_front_end)

        response["decklist"] = tts_decklist

    elif export_type == "text":

        plain_text_decklist = generatePlainTextDeckList(decklist_from_front_end)

        response["decklist"] = plain_text_decklist

    response["export_type"] = export_type

    return response

def handleFilterCards(message):
    """
    This function is called when the user hits the Filter Cards button. It will contain
    a key called "filters", which itself is a large dictionary that may contain any or
    all of the following fields:

    String values to be converted to lists:
    pirate_type

    String values to be converted to integers:
    firepower

    String values:
    firepower_relativity
    effect_text
    pirate_code

    Taking all of that info, we must process the data and repackage the filters as a
    properly formatted dictionary so getCardList can get the correct cards.
    """

    response = {}

    raw_filters = message["filters"]

    filters = repackageRawFilters(raw_filters)

    print(filters)

    cards = getCardList(filters)

    response["cards"] = cards

    return response

def handleBuildCrew(message):
    """
    This function is called when the user hits the Build Crew button. It will collect a list of
    cards based on the desired crew, then send a message to the front end telling it to add
    those cards to localStorage. Then, it will tell the front end to refresh.
    """

    response = {}

    crew = message["crew"]

    raw_filters = {}
    raw_filters["crew"] = crew

    filters = repackageRawFilters(raw_filters)

    cards = getCardList(filters)

    response["cards"] = cards
    response["crew"] = crew

    return response