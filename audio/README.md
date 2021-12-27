# Screen component

## Installing
This project is run with Python3.

Run ```pip3 install -r requirements.txt``` from the audio folder to install all dependencies (on Windows the binary may be called pip).

## Running
Run the project with ```python main.py``` from the audio folder. Possible arguments are the following:
| Parameter         | Type   | Default value | Description                                            |
| ----------------- | ------ | ------------- | ------------------------------------------------------ |
| --address         | string | "localhost"   | IP address or hostname to Core instance                |
| --port            | int    | 8001          | Port to Core instance                                  |
| --enable-ws-debug |        | False         | If set, enables websocket debug information            |
| --no-reconnect    |        | False         | If set, disables the reconnect feature                 |
| --reconnect-time  | int    | 3000          | Time (in ms) from a disconnect to reconnection attempt |


## Visual Studio Code configuration
There is a run configuration available for the audio module. Just open the entire repo folder in Visual studio code and
it should automagically know how to run etc. Yay!
