# This should be copied to the Raspberry
# Currently contains a hard-coded address to Anton's laptop,
# and just a random pin
import socket
import RPi.GPIO as GPIO

serverMACAddress = "0C:60:76:8B:10:F4"
port = 5

GPIO.setmode(GPIO.BCM)
GPIO.setup(14, GPIO.OUT)

s = socket.socket(socket.AF_BLUETOOTH, socket.SOCK_STREAM, socket.BTPROTO_RFCOMM)
s.connect((serverMACAddress, port))
print("connected")
while 1:
    data = s.recv(1024)
    print(f"Got command: {data}")
    if data == b"on":
        print("Turning on pin 14")
        GPIO.output(14, 1)
    elif data == b"off":
        print("Turning off pin 14")
        GPIO.output(14, 0)
s.close()
