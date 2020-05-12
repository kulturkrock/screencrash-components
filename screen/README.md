# Screen component

## Installing
This project is built with Electron. Install Electron from [here]().

Run ```npm install``` from screen folder to install all dependencies.

## Running
Run the project with ```electron .```

## Visual Studio Code project
This is also available as a visual studio code project. Just open the folder in Visual studio code and it should automagically know stuff like how to run etc. Yay!

## Using dummy-core to trigger actions
To run dummy-core, issue the command ```node ../dummy_core/index.js```.
Once in the dummy_core prompt, here are some examples that will trigger actions in the screen component

* {"command": "create", "entity_id": 1337, "type": "video", "channel": 1, "resource": "file:///C:/Users/matzl/Pictures/test_video.mp4"}
* {"command": "create", "entity_id": 1338, "type": "image", "channel": 1, "resource": "file:///C:/Users/matzl/Pictures/options.PNG"}

Change the resource paths to paths that exist on your file system. At the moment only MP4 files are supported for videos.