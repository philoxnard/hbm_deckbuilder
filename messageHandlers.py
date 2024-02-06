
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