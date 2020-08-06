import pyaudio
import wave


class Audio:

    def __init__(self, file):
        self.file = file
        self.CHUNK = 1024

    def play_audio(self):
        wf = wave.open(self.file, 'rb')

        p = pyaudio.PyAudio()

        stream = p.open(format=p.get_format_from_width(wf.getsampwidth()),
                        channels=wf.getnchannels(),
                        rate=wf.getframerate(),
                        output=True)

        data = wf.readframes(self.CHUNK)

        while len(data) > 0:
            stream.write(data)
            data = wf.readframes(self.CHUNK)

        stream.stop_stream()
        stream.close()

        p.terminate()
