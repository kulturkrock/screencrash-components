import json

class CommandHandler:

    def __init__(self):
        self._clips = {}

    def handle_message(self, message):
        print("Got message: {}".format(message))
        return {"messageType": "nah", "somedata": "hi"}