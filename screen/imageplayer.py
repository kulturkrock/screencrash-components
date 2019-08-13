
import cv2


class ImageFilePlayer:

    def __init__(self, window_name, path):
        """Init the image player/viewer. Loads the file."""
        self.window_name = window_name
        self.image_path = path
        self.image = None

    def preload(self):
        self.image = cv2.imread(self.image_path)

    def play(self):
        """Displays the image."""
        # Load image if not loaded
        if not self.image:
            self.preload()

        # TODO: Add any potential effects on the image here

        # Show image
        cv2.imshow(self.window_name, self.image)
        cv2.waitKey(1)
