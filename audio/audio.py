import random
import string

import os
os.environ['PYGAME_HIDE_SUPPORT_PROMPT'] = "hide"
import pygame as pg

class AudioMixer:

    def __init__(self, nof_max_sounds=20):
        pg.mixer.init()
        pg.init()
        pg.mixer.set_num_channels(nof_max_sounds)
        self._sounds = {}

    def _generate_id(self):
        while True:
            val = ''.join(random.choice(string.ascii_uppercase) for _ in range(16))
            if not val in self._sounds:
                return val

    def add(self, path, loops=0, autostart=False):
        sound = pg.mixer.Sound(path)
        free_channel = pg.mixer.find_channel()
        if free_channel is None:
            print("No free channels to play sound on. Oh noes!")
            return None

        free_channel.play(sound, loops=loops)
        if not autostart:
            free_channel.pause()

        sound_id = self._generate_id()
        self._sounds[sound_id] = free_channel
        return sound_id

    def play(self, sound_id):
        sound_channel = self._sounds.get(sound_id)
        if sound_channel:
            sound_channel.unpause()
        return sound_channel is not None

    def pause(self, sound_id):
        sound_channel = self._sounds.get(sound_id)
        if sound_channel:
            sound_channel.pause()
        return sound_channel is not None

    def stop(self, sound_id):
        sound_channel = self._sounds.get(sound_id)
        if sound_channel:
            sound_channel.stop()
        return sound_channel is not None

    def is_running(self, sound_id):
        sound_channel = self._sounds.get(sound_id)
        return sound_channel or sound_channel.get_busy()

    def get_volume(self, sound_id):
        sound_channel = self._sounds.get(sound_id)
        return sound_channel.get_volume() if sound_channel else -1

    def set_volume(self, sound_id, volume):
        sound_channel = self._sounds.get(sound_id)
        if sound_channel:
            sound_channel.set_volume(volume)
        return sound_channel is not None

    def set_volume_stereo(self, sound_id, volume_left, volume_right):
        sound_channel = self._sounds.get(sound_id)
        if sound_channel:
            sound_channel.set_volume(volume_left, volume_right)
        return sound_channel is not None
