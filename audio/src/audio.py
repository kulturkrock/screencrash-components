import threading

import os
import time

os.environ['PYGAME_HIDE_SUPPORT_PROMPT'] = "hide"
import pygame as pg

class AudioMixer:

    def __init__(self, event_callback, nof_max_sounds=20):
        pg.mixer.init()
        pg.init()
        pg.mixer.set_num_channels(nof_max_sounds)
        self._event_callback = event_callback
        self._sounds = {}
        self._sound_infos = {}
        self._end_events = {}
        self._current_end_event = 1000

        self._event_handle_thread = threading.Thread(target=self._handle_pygame_event)
        self._event_handle_thread.start()

    def _emit(self, event_type, sound_id):
        if self._event_callback:
            self._event_callback(event_type, sound_id)
        else:
            print(f"Mixer wants to emit event {event_type} for {sound_id}")

    def _handle_pygame_event(self):
        while True:
            event = pg.event.wait()
            if event.type in self._end_events:
                sound_id = self._end_events[event.type]
                self._emit("removed", sound_id)

    def add(self, sound_id, path, loops=0, autostart=False):
        sound = pg.mixer.Sound(path)
        free_channel = pg.mixer.find_channel()
        if free_channel is None:
            print("No free channels to play sound on. Oh noes!")
            return False

        self._sounds[sound_id] = free_channel
        self._sound_infos[sound_id] = {
            "duration": sound.get_length(),
            "current_time": 0,
            "last_sync": int(time.time() * 1000),
            "playing": autostart,
            "muted": False,
            "last_volume": -1,
        }
        free_channel.set_endevent(self._current_end_event)
        self._end_events[self._current_end_event] = sound_id
        self._current_end_event += 1

        free_channel.play(sound, loops=loops)
        if not autostart:
            free_channel.pause()

        self._emit("added", sound_id)

        return True

    def _update_sound_info(self, sound_id, is_playing):
        sound_info = self._sound_infos[sound_id]
        now = int(time.time() * 1000)
        if sound_info["playing"]:
            sound_info["current_time"] += (now - sound_info["last_sync"])
        sound_info["playing"] = is_playing
        sound_info["last_sync"] = now

    def play(self, sound_id):
        sound_channel = self._sounds.get(sound_id)
        if sound_channel:
            self._update_sound_info(sound_id, True)
            sound_channel.unpause()
            self._emit("changed", sound_id)
        return sound_channel is not None

    def pause(self, sound_id):
        sound_channel = self._sounds.get(sound_id)
        if sound_channel:
            self._update_sound_info(sound_id, False)
            sound_channel.pause()
            self._emit("changed", sound_id)
        return sound_channel is not None

    def stop(self, sound_id):
        sound_channel = self._sounds.get(sound_id)
        if sound_channel:
            sound_channel.stop()
            del self._sounds[sound_id]
            del self._sound_infos[sound_id]
            # No need to send event, will be caught automatically
        return sound_channel is not None

    def is_running(self, sound_id):
        sound_channel = self._sounds.get(sound_id)
        return sound_channel and sound_channel.get_busy()

    def get_volume(self, sound_id):
        sound_channel = self._sounds.get(sound_id)
        if sound_channel:
            sound = sound_channel.get_sound()
            return round(sound.get_volume()*100) if sound else 0
        return 0

    def get_duration(self, sound_id):
        sound_channel = self._sounds.get(sound_id)
        if sound_channel:
            sound = sound_channel.get_sound()
            return sound.get_length() if sound else 0
        return 0

    def get_sound_info(self, sound_id):
        return self._sound_infos.get(sound_id)

    def set_volume(self, sound_id, volume, skip_event=False):
        sound_channel = self._sounds.get(sound_id)
        sound_info = self._sound_infos.get(sound_id)
        sound = None
        if sound_channel and sound_info:
            sound = sound_channel.get_sound()
            if sound:
                sound.set_volume(volume/100)
                sound_info["last_volume"] = volume
                if volume != 0:
                    sound_info["muted"] = False
                if not skip_event:
                    self._emit("changed", sound_id)
        return sound is not None

    def set_volume_stereo(self, sound_id, volume_left, volume_right, skip_event=False):
        sound_channel = self._sounds.get(sound_id)
        sound_info = self._sound_infos.get(sound_id)
        sound = None
        if sound_channel and sound_info:
            sound = sound_channel.get_sound()
            if sound:
                sound.set_volume(volume_left/100, volume_right/100)
                sound_info["last_volume"] = (volume_left, volume_right)
                if volume_left != 0 or volume_right != 0:
                    sound_info["muted"] = False
                if not skip_event:
                    self._emit("changed", sound_id)
        return sound is not None

    def toggle_mute(self, sound_id):
        sound_channel = self._sounds.get(sound_id)
        sound_info = self._sound_infos.get(sound_id)
        if sound_channel and sound_info:
            if sound_info["muted"]:
                if type(sound_info["last_volume"]) == tuple:
                    left_vol, right_vol = sound_info["last_volume"]
                    self.set_volume_stereo(sound_id, left_vol, right_vol, skip_event=True)
                else:
                    self.set_volume(sound_id, sound_info["last_volume"], skip_event=True)
                sound_info["muted"] = False
            else:
                prev_volume = self.get_volume(sound_id)
                self.set_volume(sound_id, 0)
                sound_info["last_volume"] = prev_volume
                sound_info["muted"] = True
                
            self._emit("changed", sound_id)

