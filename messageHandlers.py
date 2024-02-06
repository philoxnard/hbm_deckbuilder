
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
    response["result"] = "Success"

    return response

def handleExportDecklist(message):
    """
    This function is called when the user hits the Export button. It will
    contain a key called "stringified_decklist", which is a long stringified
    JSON object full of key/value pairs such as {} "cannon_boo" : 2 } which
    denotes what cards are to be added to the decklist and in what quantity.

    This function will take that information and use it to go through db.json
    and add the appropriate cards/quantities to the decklist. 

    See sample_decklist.json to see what the ultimate output of this function
    should look like.
    """

    response = {}

    stringified_decklist = message["stringified_decklist"]
    decklist_from_front_end = json.loads(stringified_decklist)

    decklist_json_obj = {}

    decklist_json_obj = generateHeader(decklist_json_obj)

    decklist_json_obj = generateObjectStates(decklist_json_obj, decklist_from_front_end)

    decklist_json_obj = generateFooter(decklist_json_obj)

    string_list = json.dumps(decklist_json_obj)

    response["tts_decklist"] = string_list

    return response