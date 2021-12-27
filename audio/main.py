import argparse
import threading
import json
from commandhandler import CommandHandler
from coreconnection import CoreConnection

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Audio component for ScreenCrash")
    parser.add_argument("--address", type=str, default="localhost", help="IP address or hostname to Core instance. Default localhost")
    parser.add_argument("--port", type=int, default=8001, help="Port to Core instance. Default 8001")
    parser.add_argument("--enable-ws-debug", action="store_true", help="Enables debug messages from websocket module")
    parser.add_argument("--no-reconnect", action="store_true", help="Do not reconnect if connection is lost")
    parser.add_argument("--reconnect-time", type=int, default=3000, help="Time (in ms) between disconnect and reconnection attempt. Cannot be used with --no-reconnect flag. Default 3000ms")
    args = parser.parse_args()

    if args.enable_ws_debug:
        import websocket
        websocket.enableTrace(True)

    cmd_handler = CommandHandler()
    core_connection = CoreConnection(cmd_handler.handle_message, args.address, args.port, not args.no_reconnect, args.reconnect_time)
    connection_thread = threading.Thread(target=core_connection.run)
    connection_thread.start()

    while True:
        try:
            cmd = input()
            data = json.loads(cmd)
            result = cmd_handler.handle_message(data)
            print(json.dumps(result) if result else "[No response]")
        except KeyboardInterrupt:
            core_connection.stop()
            break
        except:
            print("Invalid data. Only valid JSON accepted")

    connection_thread.join()
    print("Shutting down audio component...")