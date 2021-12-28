import json

from audio import AudioMixer

class CommandHandler:

    def __init__(self):
        self._mixer = AudioMixer()
        self._sounds = {}

    def _create_error_msg(self, msg):
        result = {"messageType": "cmd-error", "msg": msg}
        return result

    def handle_message(self, message):
        try:
            cmd = message["command"]
            entity_id = message["entity_id"]
            return self._handle_command(cmd, entity_id, message)
        except Exception as e:
            return self._create_error_msg(f"Failed to carry out command. {e}")

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
        else:
            print("Unhandled message: {}".format(message))
            return self._create_error_msg("Unsupported command")

    def _add_sound(self, entity_id, params):
        path = params["assets"][0]
        loops = params.get("loops", 1) - 1  # pygame uses zero indexing for this
        autostart = params.get("autostart", False)
        sound_id = self._mixer.add(path=path, loops=loops, autostart=autostart)
        if sound_id is None:
            return self._create_error_msg("Unable to add sound. No more channels?")
        self._sounds[entity_id] = sound_id

    def _play(self, entity_id):
        sound_id = self._sounds.get(entity_id)
        if not sound_id:
            return self._create_error_msg("Audio not found. Did you add it?")
        self._mixer.play(sound_id)

    def _pause(self, entity_id):
        sound_id = self._sounds.get(entity_id)
        if not sound_id:
            return self._create_error_msg("Audio not found. Did you add it?")
        self._mixer.pause(sound_id)

    def _stop(self, entity_id):
        sound_id = self._sounds.get(entity_id)
        if not sound_id:
            return self._create_error_msg("Audio not found. Did you add it?")
        self._mixer.stop(sound_id)

    def _set_volume(self, entity_id, params):
        sound_id = self._sounds.get(entity_id)
        if not sound_id:
            return self._create_error_msg("Audio not found. Did you add it?")
        if not params.get("volume_left") is None or not params.get("volume_right") is None:
            left = params.get("volume_left", 0)
            right = params.get("volume_right", 0)
            self._mixer.set_volume_stereo(sound_id, left / 100, right / 100)
        else:
            self._mixer.set_volume(sound_id, params.get("volume", 50) / 100)
