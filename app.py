from flask import Flask, render_template, request
import json


from messageHandlers import *

app = Flask(__name__)

@app.route("/")
def index():

    db = open("db.json")

    db_json = json.load(db)

    return render_template('index.html')

@app.route("/receive", methods=['POST'])
def receive():

    message = request.json['data']

    command = message["command"]

    if command == "command_on_load":

        response = handleOnLoad(message)

    elif command == "command_export_decklist":

        response = handleExportDecklist(message)

    elif command == "command_filter_cards":

        response = handleFilterCards(message)

    else:

        print('error catch for no command')

    response["command"] = command
    return response

if __name__ == "__main__":

    app.run(debug=True)