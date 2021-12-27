import json

from audio import AudioMixer

class CommandHandler:

    def __init__(self):
        self._mixer = AudioMixer()
        self._sounds = {}

    def handle_message(self, message):
        cmd = message["command"]
        entity_id = message["entity_id"]
        if cmd == "add":
            path = message.get("path")
            if path is None:
                return {"error": "Invalid path when adding audio"}
            loops = message.get("loops", 0)
            sound_id = self._mixer.add(path=path, loops=loops)
            if sound_id is None:
                return {"error": "Unable to add sound. No more channels?"}
            self._sounds[entity_id] = sound_id
        elif cmd == "play":
            sound_id = self._sounds.get(entity_id)
            if not sound_id:
                return {"error": "Audio not found. Did you add it?"}
            self._mixer.play(sound_id)
        elif cmd == "pause":
            sound_id = self._sounds.get(entity_id)
            if not sound_id:
                return {"error": "Audio not found. Did you add it?"}
            self._mixer.pause(sound_id)
        elif cmd == "stop":
            sound_id = self._sounds.get(entity_id)
            if not sound_id:
                return {"error": "Audio not found. Did you add it?"}
            self._mixer.stop(sound_id)
        elif cmd == "set_volume":
            sound_id = self._sounds.get(entity_id)
            if not sound_id:
                return {"error": "Audio not found. Did you add it?"}
            if message.get("volume_left") or message.get("volume_right"):
                left = message.get("volume_left", 0)
                right = message.get("volume_right", 0)
                self._mixer.set_volume_stereo(sound_id, left / 100, right / 100)
            else:
                self._mixer.set_volume(sound_id, message.get("volume", 50) / 100)
        else:
            print("Unhandled message: {}".format(message))
