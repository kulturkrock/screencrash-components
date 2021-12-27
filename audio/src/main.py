import argparse
import threading
import json
from time import sleep
import traceback
from commandhandler import CommandHandler
from coreconnection import CoreConnection


def run_cli(cmd_handler):
    print("----------------------------------------------------------------------------------")
    print("Welcome to the Audio Component CLI!")
    print("Either enter a valid JSON command or 'file <file>' to execute a prepared sequence.")
    print("See res/instructions.txt as an example of such a prepared sequence.")
    print("Press Ctrl + C to exit the Audio Component")
    print("----------------------------------------------------------------------------------")
    while True:
        try:
            cmd = input()
            if cmd.startswith("file "):
                run_file(cmd_handler, cmd.split(" ")[1])
                continue
            data = json.loads(cmd)
            result = cmd_handler.handle_message(data)
            print(json.dumps(result) if result else "[No response]")
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"Failed to handle command: {e}")
            traceback.print_exc()
            continue

def run_file(cmd_handler, path):
    print(f"Running file {path}")
    with open(path, "r") as f:
        for line in f.readlines():
            if line.startswith("sleep "):
                sleep_time = float(line.split(" ")[1])
                print(f"-- Sleeping {sleep_time}")
                sleep(sleep_time)
            else:
                print(f"-- Running {line}")
                try:
                    cmd_handler.handle_message(json.loads(line))
                except:
                    print("Failed to run line. Skipping...")


def main():
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

    run_cli(cmd_handler)

    core_connection.stop()
    connection_thread.join()
    print("Shutting down audio component...")


if __name__ == "__main__":
    main()