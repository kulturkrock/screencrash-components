
import argparse
import time
from imageplayer import ImageFilePlayer
from videoplayer import VideoFilePlayer
from utils import prepare_window, remove_all_windows, clear_window

# Specify the name for the main window.
# Nor variable name or value has magic names
# (they can be renamed without any issues rising)
WINDOW_NAME = "screen"
# Use secondary monitor if possible
PREFERRED_SCREEN = 2


def main():
    """Main function for this test file."""
    ap = argparse.ArgumentParser()
    ap.add_argument("-i", "--image", required=False, help="Path to input image file")
    ap.add_argument("-v", "--video", required=False, help="Path to input video file")
    args = vars(ap.parse_args())

    prepare_window(WINDOW_NAME, PREFERRED_SCREEN)

    if args.get("image"):
        player = ImageFilePlayer(WINDOW_NAME, args["image"])
        player.play()
        time.sleep(5)       # Show image for 5 seconds
        clear_window(WINDOW_NAME)
    elif args.get("video"):
        player = VideoFilePlayer(WINDOW_NAME, args["video"])
        # player.preload()
        player.play()
        clear_window(WINDOW_NAME)

    remove_all_windows()


if __name__ == "__main__":
    # Just run the main function.
    main()
