import os
from queue import SimpleQueue, Empty
import time
import threading
import platform
import struct

# -------------------- TWEAKS FOR VLC -------------------------
is_32bit = (struct.calcsize("P") * 8 == 32)
if platform.system() == "Windows":
    if is_32bit:
        os.add_dll_directory(r"C:\Program Files (x86)\VideoLAN\VLC")
    else:
        os.add_dll_directory(r"C:\Program Files\VideoLAN\VLC")
elif platform.system() == "Linux":
    # See https://github.com/pyinstaller/pyinstaller/issues/4506
    if is_32bit:
        os.environ["VLC_PLUGIN_PATH"] = "/usr/lib/vlc/plugins"
    else:
        os.environ["VLC_PLUGIN_PATH"] = "/usr/lib64/vlc/plugins"
elif platform.system() == "Darwin":
    # Todo: Fix for Mac OS X
    raise RuntimeError("MacOS X not supported yet")
# -------------------------------------------------------------

import vlc

class AudioClip:
    """
    Implementation of the AudioClip for VLC. Documentation for 
    the VLC MediaPlayer API can be found here:
    https://www.olivieraubert.net/vlc/python-ctypes/doc/vlc.MediaPlayer-class.html
    """

    @staticmethod
    def create(event_callback, effect_type, sound_id, path, loops=0, autostart=False):
        instance = vlc.Instance("--vout=dummy")
        player = instance.media_player_new()
        player.audio_set_mute(False)    # Unmuted by default
        player.audio_set_volume(100)    # 100% volume by default
        events = player.event_manager()
        player.set_mrl(path)

        clip = AudioClip(player, effect_type, sound_id, path, loops, event_callback)
        events.event_attach(vlc.EventType.MediaPlayerEndReached, clip._playback_reached_end)
        events.event_attach(vlc.EventType.MediaPlayerStopped, clip._sound_stopped)
        events.event_attach(vlc.EventType.MediaPlayerPositionChanged, clip._position_changed)

        change_events = [
            vlc.EventType.MediaPlayerPlaying,
            vlc.EventType.MediaPlayerPaused,
            vlc.EventType.MediaPlayerMuted,
            vlc.EventType.MediaPlayerUnmuted,
            vlc.EventType.MediaPlayerAudioVolume,
            vlc.EventType.MediaPlayerTimeChanged,
            #vlc.EventType.MediaPlayerBackward,
        ]
        for event in change_events:
            events.event_attach(event, clip._on_state_changed)

        clip.play()
        if not autostart:
            clip.pause()

        threading.Thread(target=clip.run_processor).start()

        return clip


    def __init__(self, player, effect_type, sound_id, path, nof_loops, event_callback):
        self._player = player
        self._effect_type = effect_type
        self._sound_id = sound_id
        self._path = path
        self._nof_loops = nof_loops
        self._fade_out_on_end = 0
        self._stop_fade_thread = False
        self._fade_is_active = False
        self._volume_before_fade = 100
        self._queue = SimpleQueue()
        self._event_callback = event_callback

    def _playback_reached_end(self, _event=None):
        if self._nof_loops != 0:
            if self._nof_loops > 0:
                self._nof_loops -= 1
            self._restart()
        else:
            self._sound_stopped()

    def _position_changed(self, _event=None):
        if self._fade_out_on_end != 0:
            duration = self.get_duration()
            current_time = self.get_current_time()
            time_left = (duration - current_time)
            if self._nof_loops > 0:
                time_left += self._nof_loops * duration
            if time_left <= self._fade_out_on_end and not self._fade_is_active:
                self.fade(self._fade_out_on_end, None, 0, True)

    def _on_state_changed(self, _event=None):
        self._emit("changed")

    def _sound_stopped(self, _event=None):
        self._cleanup()

    def _emit(self, event):
        if self._event_callback:
            if self._has_player():
                self._event_callback(event, self._sound_id)
            else:
                print("Skipping to send event after player was removed")
        else:
            print(f"Got event {event} for {self._sound_id}")

    def _add_to_queue(self, func):
        self._queue.put(func)

    def _has_player(self):
        return self._player is not None

    def run_processor(self):
        while self._player:
            try:
                func = self._queue.get(True, 5)
                func()
            except Empty:
                # No command in pipe. Let's try again.
                pass

    def is_playing(self):
        return self._player and self._player.is_playing()

    def get_volume(self):
        return self._player.audio_get_volume() if self._player else 0

    def get_duration(self):
        return self._player.get_length() / 1000 if self._player else 0

    def get_current_time(self):
        return self._player.get_time() / 1000 if self._player else 0

    def get_path(self):
        return self._path

    def get_effect_type(self):
        return self._effect_type # audio or video

    def get_sound_info(self):
        if self._player:
            return {
                "effect_type": self.get_effect_type(),
                "duration": self.get_duration(),
                "current_time": self.get_current_time(),
                "last_sync": int(time.time() * 1000),
                "playing": self._player.is_playing() == 1,
                "looping": self._nof_loops != 0,
                "muted": self._player.audio_get_mute() == True,
            }
        return None

    def _restart(self):
        def impl():
            self._player.set_mrl(self._path)
            self._player.play()
        self._add_to_queue(impl)

    def play(self):
        def impl():
            if self._player and not self._player.is_playing():
                self._player.play()
        self._add_to_queue(impl)

    def pause(self):
        def impl():
            if self._player and self._player.is_playing():
                self._player.pause()
        self._add_to_queue(impl)

    def stop(self):
        def impl():
            if self._has_player():
                self._player.stop()
        self._add_to_queue(impl)

    def set_volume(self, volume):
        def impl():
            if self._has_player():
                self._player.audio_set_volume(volume)
        self._add_to_queue(impl)

    def toggle_mute(self):
        def impl():
            if self._has_player():
                self._player.audio_toggle_mute()
        self._add_to_queue(impl)

    # Position is given in seconds (may be float)
    def seek(self, position):
        def impl():
            if self._has_player():
                self._stop_fade()
                self._player.set_time(int(position*1000))
        self._add_to_queue(impl)

    def fade(self, duration, fr_vol, to_vol, stop_on_done):
        def impl():
            if self._fade_is_active:
                # Hacky solution to stop old fade before
                # starting this new one.
                self._stop_fade_thread = True
                time.sleep(0.2)

            self._fade_is_active = True
            self._stop_fade_thread = False
            self._volume_before_fade = self.get_volume()
            current_vol = fr_vol if fr_vol is not None else self._volume_before_fade
            interval_time = 0.1
            steps = duration / interval_time
            vol_per_step = (to_vol - current_vol) / steps
            while steps > 0 and not self._stop_fade_thread:
                if self.is_playing():
                    steps -= 1
                    current_vol += vol_per_step
                    self.set_volume(round(current_vol))
                    time.sleep(interval_time)
            if not self._stop_fade_thread and stop_on_done:
                self.stop()
            self._fade_is_active = False
        threading.Thread(target=impl).start()

    def set_fade_out_time(self, duration):
        self._fade_out_on_end = duration

    def _stop_fade(self):
        if self._fade_is_active:
            self._stop_fade_thread = True
            self.set_volume(self._volume_before_fade)

    def _cleanup(self):
        def impl():
            if self._has_player():
                instance = self._player.get_instance()
                self._player.get_media().release()
                self._player.release()
                instance.release()
                self._emit("removed")
                self._player = None
        self._add_to_queue(impl)