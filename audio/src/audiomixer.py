from audio_vlc import AudioClip
from time import sleep

class AudioMixer:

    def __init__(self, event_callback):
        self._event_callback = event_callback
        self._sounds = {}

    def _on_event_callback(self, event, sound_id):
        if event == "removed" and sound_id in self._sounds:
            del self._sounds[sound_id]
        self._event_callback(event, sound_id)

    def add(self, effect_type, sound_id, path, loops=0, autostart=False, send_add_event=True):
        clip = AudioClip.create(self._on_event_callback, effect_type, sound_id, path, loops, autostart)
        if clip:
            self._sounds[sound_id] = clip
            if send_add_event:
                self._on_event_callback("added", sound_id)
        return clip is not None

    def get_sound_info(self, sound_id):
        return self._sounds[sound_id].get_sound_info()

    def get_path(self, sound_id):
        return self._sounds[sound_id].get_path()

    def get_volume(self, sound_id):
        return self._sounds[sound_id].get_volume()

    def play(self, sound_id):
        self._sounds[sound_id].play()

    def pause(self, sound_id):
        self._sounds[sound_id].pause()

    def stop(self, sound_id):
        self._sounds[sound_id].stop()

    def set_volume(self, sound_id, volume):
        self._sounds[sound_id].set_volume(volume)

    def set_volume_stereo(self, sound_id, volume_left, volume_right):
        # Todo: Implement this properly
        self._sounds[sound_id].set_volume((volume_left+volume_right)//2)

    def toggle_mute(self, sound_id):
        self._sounds[sound_id].toggle_mute()

    # Position is given in seconds (may be float)
    def seek(self, sound_id, position):
        self._sounds[sound_id].seek(position)

    def fade(self, sound_id, time, fr_vol, to_vol, stop_on_done):
        self._sounds[sound_id].fade(time, fr_vol, to_vol, stop_on_done)

    def set_fade_out_time(self, sound_id, time):
        self._sounds[sound_id].set_fade_out_time(time)