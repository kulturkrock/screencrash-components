# screencrash-components: screen
This is the screen component for Screencrash/Skärmkrock.

## Requirements
Requirements are handled with the handy utility pipenv. Pipenv combines the strengths of pip and venv into one.

Requirements are declared in the Pipfile. Run `pipenv install` in order to install these and initialize the venv.

If you want to make it even easier, just run make in the screen folder. This will create a virtual environment for you and install all required packages in this environment.
To enter the venv and get access to the installed requirements, run `pipenv shell`.

## Running tests
The file screen.py is provided as an entry point for testing. Run this program to display videos or images.
Videos will pause 5 seconds after done playing in order to benefit debugging. This can be avoided by commenting out the time.sleep call in _screen.py_.

To run the test program use one of the following command argument combinations:

`python screen.py --image imagePathHere`

`python screen.py --video videoPathHere`

Note that non-Windows users may need to use _python3_ instead of _python_ to explicitly use Python 3.

Also note that users using make need to manually enter the created virtual environment (as described above) before running the script in order for it to work.

## Upcoming features
* Currently it is only possible to play a video in fullscreen covering the entire screen. Soon it will hopefully be possible to play it on a specific position on the screen instead (to layer images on top of each other).
* More testing of timing issues.
