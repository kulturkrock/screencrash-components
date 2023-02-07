# Raspberry component

This component talks to a Raspberry Pi through Bluetooth, and controls
GPIO pins. It will currently be used for costumes in Ragnarök, but who
knows how generic it will end up?

## How to use

You need a Raspberry Pi and a laptop, both with bluetooth.

- Connect something between the ground pin and GPIO pin 14 on the Raspberry
- Copy `on_raspberry/screencrash_listener.py` to `/home/pi/` on the Raspberry
- Copy `on_raspberry/screencrash_listener.service` to `/etc/systemd/system/` on the Raspberry
- On the Raspberry, run

  ```sh
  sudo systemctl daemon-reload
  sudo systemctl enable screencrash_listener
  ```

- Change `serverMACAddress` in `screencrash_listener.py` to the MAC address of the laptop's bluetooth device
- On the laptop, run `CORE=<core IP> make dev`
- You can now control whatever you connected from Core
