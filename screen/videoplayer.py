# Video player
# Created 2019-08-07
# Inspired by https://www.pyimagesearch.com/2017/02/06/faster-video-file-fps-with-cv2-videocapture-and-opencv/

from threading import Thread
from queue import Queue
import time
import cv2


class VideoFilePlayer:

    def __init__(self, window_name, path):
        """Init the video player. Does not start loading file."""
        self.window_name = window_name
        self.stream = FileVideoStream(path)

    def preload(self):
        """Starts to load the video into memory."""
        self.stream.start()

    def play(self):
        """Starts playback of the video, plays until end of file."""
        if not self.stream.is_running():
            # Video has not been pre loaded. Start loading.
            self.preload()

        while self.stream.is_running() and not self.stream.more():
            # Video has not had time to buffer any data, give it some time.
            time.sleep(1)

        wait_time = int(1000.0 / self.stream.video_speed())
        while self.stream.more():
            # Read image frame from queue
            frame = self.stream.read()

            # TODO: Add any potential effects on the video frame here

            # Show frame
            cv2.imshow(self.window_name, frame)
            # Make sure fps is correct
            cv2.waitKey(wait_time)


class FileVideoStream:

    def __init__(self, path, queue_size=128):
        """Init video stream data (does not start reading data)."""
        self.stream = cv2.VideoCapture(path)
        self.running = False
        self.queue = Queue(maxsize=queue_size)

    def start(self):
        """Start buffering data."""
        self.running = True
        t = Thread(target=self.update, args=())
        t.daemon = True
        t.start()
        return self

    def update(self):
        """Read video frames and buffer them in a local queue."""
        while self.running:
            if not self.queue.full():
                # Fetch video frame
                (grabbed, frame) = self.stream.read()

                # Skip out if end of file reached
                if not grabbed:
                    self.stop()
                    return

                # Store frame for later retrieval
                self.queue.put(frame)

    def video_speed(self):
        """The FPS of the video file."""
        return self.stream.get(cv2.CAP_PROP_FPS)

    def read(self):
        """Read a video frame from the buffer."""
        return self.queue.get()

    def more(self):
        """Check whether the buffer contains more data."""
        return self.queue.qsize() > 0

    def is_running(self):
        """Check whether buffering process is active."""
        return self.running

    def stop(self):
        """Stop the buffering process."""
        self.running = False
