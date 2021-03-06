# Screen component

## Installing
This project is built with Electron.

Run ```npm install``` from the screen folder to install all dependencies.

## Running
Run the project with ```node_modules/electron/dist/electron.exe .``` from the screen folder (use backslashes if running in Windows CMD).

## Visual Studio Code project
This is also available as a visual studio code project. Just open the folder in Visual studio code and it should automagically know stuff like how to run etc. Yay!

## Using dummy-core to trigger actions
To run dummy-core, cd to the dummy_core directory and issue the command ```npm start```.
Once in the dummy_core prompt, here are some examples that will trigger actions in the screen component

```
/* Play video */
{"command": "create", "entity_id": 1337, "channel": 1, "type": "video", "resource": "file:///C:/Users/matzl/Pictures/test_video.mp4"}
{"command": "show", "entity_id": 1337, "channel": 1}
{"command": "play", "entity_id": 1337, "channel": 1}

/* Show image */
{"command": "create", "entity_id": 1338, "type": "image", "channel": 1, "resource": "file:///C:/Users/matzl/Pictures/options.PNG"}
{"command": "show", "entity_id": 1338, "channel": 1}

/* Set viewport size (any media). All size arguments are optional. Defaults to top left corner, 100% width and height */
{"command": "viewport", "entity_id": 1338, "x": 50, "y": 50, "width": 50, "height": 50, "usePercentage": false}
{"command": "viewport", "entity_id": 1338, "width": 50, "usePercentage": true}

/* Setting viewport size with a mix of pixels and percentage */
{"command": "viewport", "entity_id": 1338, "x": 0, "y": 0, "usePercentage": false}
{"command": "viewport", "entity_id": 1338, "width": 50, "height": 50, "usePercentage": true}

/* Set layer (higher numbers are put on top of lower layers) */
{"command": "layer", "entity_id": 1338, "layer": 10}

/* Advanced creation of media objects (combine commands) */
{"command": "create", "entity_id": 1338, "type": "image", "channel": 1, "resource": "file:///C:/Users/matzl/Pictures/options.PNG", "x": 50, "y": 50, "width": 50, "height": 50, "usePercentage": false, "layer": 50}

{"command": "create", "entity_id": 1338, "type": "image", "channel": 1, "resource": "file:///C:/Users/matzl/Pictures/options.PNG", "width": 50, "height": 50, "usePercentage": true, "visible": true, "layer": 10}
{"command": "create", "entity_id": 1339, "type": "image", "channel": 1, "resource": "file:///C:/Users/matzl/Pictures/options.PNG", "visible": true, "layer": 5}
```

Change the resource paths to paths that exist on your file system. At the moment only MP4 files are supported for videos.
