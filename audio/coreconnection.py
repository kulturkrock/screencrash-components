import websocket
import json
from time import sleep

class CoreConnection:

    def __init__(self, on_message_callback, address = "localhost", port = 8001, reconnect = True, reconnect_time = 3000):
        self._handle_message_callback = on_message_callback
        self._address = address
        self._port = port
        self._reconnect = reconnect
        self._reconnect_time = reconnect_time
        self._ws = None

    def run(self):
        while self._reconnect:
            url = "ws://{}:{}".format(self._address, self._port)
            self._ws = websocket.WebSocketApp(url,
                                            on_open=self._on_open,
                                            on_message=self._on_message,
                                            on_error=self._on_error,
                                            on_close=self._on_close)

            self._ws.run_forever(ping_interval=1, ping_payload=self._get_heartbeat_msg())

            if self._reconnect:
                sleep(self._reconnect_time / 1000.0)
                print("Reconnecting...")

    def stop(self):
        self._reconnect = False
        if self._ws:
            self._ws.close()

    def _get_heartbeat_msg(self):
        return json.dumps({
            "messageType": "heartbeat",
            "component": "audio",
            "channel": 1
        })

    def _on_message(self, ws, message):
        if self._handle_message_callback:
            data = json.loads(message)
            response = self._handle_message_callback(data)
            if response is None:
                ws.send(json.dumps(response))
        else:
            print("Got message: {} (no message handler)".format(message))

    def _on_open(self, ws):
        print("Connected to core")
        ws.send(json.dumps({ "client": "audio" }))

    def _on_error(self, ws, error):
        print("Got error: {}".format(error if str(error) else "[Unknown]"))

    def _on_close(self, ws, close_status_code, close_msg):
        print("Connection closed to core. Code={}. Message={}".format(close_status_code, close_msg))
        self._ws = None