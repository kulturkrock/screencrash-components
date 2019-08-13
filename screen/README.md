# screencrash-components: screen
This is the screen component for Screencrash/Skärmkrock.

## Requirements
Requirements are declared in the requirements.txt file. Run `pip install -r requirements.txt` in order to install these.

## Running tests
The file screen.py is provided as an entry point for testing. Run this program to display videos or images.
Videos will pause 5 seconds after done playing in order to benefit debugging. This can be avoided by commenting out the time.sleep call in _screen.py_.

To run the test program use one of the following command argument combinations:

`python screen.py --image imagePathHere`

`python screen.py --video videoPathHere`

Note that non-Windows users may need to use _python3_ instead of _python_ to explicitly use Python 3.

## Upcoming features
* Currently it is only possible to play a video in fullscreen covering the entire screen. Soon it will hopefully be possible to play it on a specific position on the screen instead (to layer images on top of each other).
* More testing of timing issues.
