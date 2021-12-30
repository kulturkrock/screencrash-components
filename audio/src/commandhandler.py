import time
from pathlib import Path
from audio import AudioMixer

class CommandHandler:

    def __init__(self):
        self._mixer = AudioMixer(self._handle_event)
        self._custom_event_handler = None
        self._sounds = {}

    def _send_event(self, data):
        if self._custom_event_handler:
            self._custom_event_handler(data)
        else:
            print(f"Got an event: {data}")

    def _create_error_msg(self, msg):
        result = {"messageType": "cmd-error", "msg": msg}
        return result

    def set_event_handler(self, event_handler):
        self._custom_event_handler = event_handler

    def handle_message(self, message):
        try:
            cmd = message["command"]
            entity_id = message["entityId"]
            return self._handle_command(cmd, entity_id, message)
        except Exception as e:
            return self._create_error_msg(f"Failed to carry out command. {e}")

    def _handle_event(self, event_type, entity_id):
        if event_type == "removed":
            self._send_event({"messageType": "effect-removed", "entityId": entity_id})
        elif event_type == "changed" or event_type == "added":
            sound_info = self._mixer.get_sound_info(entity_id)
            data = {
                "messageType": f"effect-{event_type}",
                "entityId": entity_id,
                "name": Path(self._sounds.get(entity_id, "")).stem,
                "duration": sound_info["duration"],
                "currentTime": sound_info["current_time"],
                "lastSync": sound_info["last_sync"],
                "playing": sound_info["playing"],
                "muted": sound_info["muted"],
                "volume": int(self._mixer.get_volume(entity_id) * 100),
            }
            self._send_event(data)
        else:
            print(f"Got unhandled event {event_type} with sound_id={entity_id}")

    def _handle_command(self, cmd, entity_id, message):
        if cmd == "add":
            self._add_sound(entity_id, message)
        elif cmd == "play":
            self._play(entity_id)
        elif cmd == "pause":
            self._pause(entity_id)
        elif cmd == "stop":
            self._stop(entity_id)
        elif cmd == "set_volume":
            self._set_volume(entity_id, message)
        elif cmd == "toggle_mute":
            self._toggle_mute(entity_id)
        else:
            print("Unhandled message: {}".format(message))
            return self._create_error_msg("Unsupported command")

    def _add_sound(self, entity_id, params):
        path = params["asset"]
        loops = params.get("loops", 1) - 1  # pygame uses zero indexing for this
        autostart = params.get("autostart", False)
        self._sounds[entity_id] = path

        if not self._mixer.add(entity_id, path=path, loops=loops, autostart=autostart):
            del self._sounds[entity_id]
            return self._create_error_msg("Unable to add sound. No more channels?")

    def _play(self, entity_id):
        if entity_id not in self._sounds:
            return self._create_error_msg("Audio not found. Did you add it?")
        self._mixer.play(entity_id)

    def _pause(self, entity_id):
        if entity_id not in self._sounds:
            return self._create_error_msg("Audio not found. Did you add it?")
        self._mixer.pause(entity_id)

    def _stop(self, entity_id):
        if entity_id not in self._sounds:
            return self._create_error_msg("Audio not found. Did you add it?")
        self._mixer.stop(entity_id)

    def _toggle_mute(self, entity_id):
        if entity_id not in self._sounds:
            return self._create_error_msg("Audio not found. Did you add it?")
        self._mixer.toggle_mute(entity_id)

    def _set_volume(self, entity_id, params):
        if entity_id not in self._sounds:
            return self._create_error_msg("Audio not found. Did you add it?")
        if "volumeLeft" in params or "volumeRight" in params:
            left = params.get("volumeLeft", 0)
            right = params.get("volumeRight", 0)
            self._mixer.set_volume_stereo(entity_id, left / 100, right / 100)
        else:
            self._mixer.set_volume(entity_id, params.get("volume", 50) / 100)
