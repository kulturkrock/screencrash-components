# This script should be placed on the Raspberry that the component should talk to
# Currently it only prints the messages to stdout
import socket

serverMACAddress = "0C:60:76:8B:10:F4"
port = 5

s = socket.socket(socket.AF_BLUETOOTH, socket.SOCK_STREAM, socket.BTPROTO_RFCOMM)
s.connect((serverMACAddress, port))
print("connected")
while 1:
    data = s.recv(1024)
    print(data)
s.close()
