
audio_commands = [
    {
        "cmd": "file",
        "desc": "Store file to resource folder",
        "params": [
            {"name": "path", "type": "string", "desc": "Relative path to asset", "default": None, "required": True},
            {"name": "data", "type": "raw", "desc": "Base64 raw data of file", "default": None, "required": True}
        ]
    },
    {
        "cmd": "add",
        "desc": "Add a sound clip. This will create a player for the clip and load it from file",
        "params": [
            {"name": "asset", "type": "string", "desc": "Path to sound clip", "default": None, "required": True},
            {"name": "entityId", "type": "string", "desc": "ID to reference this clip by", "default": None, "required": True},
            {"name": "loops", "type": "number", "desc": "Number of times to play clip. 0 means inf. times", "default": 1, "required": False},
            {"name": "autostart", "type": "boolean", "desc": "Starts the clip immediately if set to true", "default": True, "required": False}
        ]
    },
    {
        "cmd": "play",
        "desc": "Start playback of audio clip",
        "params": [
            {"name": "entityId", "type": "string", "desc": "ID of audio clip", "default": None, "required": True}
        ]
    },
    {
        "cmd": "pause",
        "desc": "Pause playback of audio clip",
        "params": [
            {"name": "entityId", "type": "string", "desc": "ID of audio clip", "default": None, "required": True}
        ]
    },
    {
        "cmd": "stop",
        "desc": "Stop playback of audio clip",
        "params": [
            {"name": "entityId", "type": "string", "desc": "ID of audio clip", "default": None, "required": True}
        ]
    },
    {
        "cmd": "toggle_mute",
        "desc": "Toggle mute/unmute of audio clip",
        "params": [
            {"name": "entityId", "type": "string", "desc": "ID of audio clip", "default": None, "required": True}
        ]
    },
    {
        "cmd": "set_volume",
        "desc": "Set volume of audio clip. If volume_left or volume_right param is set, stereo mode is used",
        "params": [
            {"name": "entityId", "type": "string", "desc": "ID of audio clip", "default": None, "required": True},
            {"name": "volume", "type": "number", "desc": "Volume to set. Ignored if volume_left or volume_right is set", "default": 0, "required": False},
            {"name": "volume_left", "type": "number", "desc": "Volume to set left speaker to (if stereo mode is used)", "default": 0, "required": False},
            {"name": "volume_right", "type": "number", "desc": "Volume to set right speaker to (if stereo mode is used)", "default": 0, "required": False},
        ]
    }
]

video_commands = [
    {
        "cmd": "file",
        "desc": "Store file to resource folder",
        "params": [
            {"name": "path", "type": "string", "desc": "Relative path to asset", "default": None, "required": True},
            {"name": "data", "type": "raw", "desc": "Base64 raw data of file", "default": None, "required": True}
        ]
    },
    {
        "cmd": "create",
        "desc": "Add a video clip (only sound part). This will create a player for the clip and load it from file",
        "params": [
            {"name": "asset", "type": "string", "desc": "Path to video clip", "default": None, "required": True},
            {"name": "entityId", "type": "string", "desc": "ID to reference this clip by", "default": None, "required": True},
            {"name": "looping", "type": "number", "desc": "Number of times to play clip. 0 means inf. times", "default": 1, "required": False},
            {"name": "autostart", "type": "boolean", "desc": "Starts the clip immediately if set to true", "default": True, "required": False}
        ]
    },
    {
        "cmd": "play",
        "desc": "Start playback of video clip",
        "params": [
            {"name": "entityId", "type": "string", "desc": "ID of video clip", "default": None, "required": True}
        ]
    },
    {
        "cmd": "pause",
        "desc": "Pause playback of video clip",
        "params": [
            {"name": "entityId", "type": "string", "desc": "ID of video clip", "default": None, "required": True}
        ]
    },
    {
        "cmd": "destroy",
        "desc": "Stop playback of video clip",
        "params": [
            {"name": "entityId", "type": "string", "desc": "ID of video clip", "default": None, "required": True}
        ]
    },
    {
        "cmd": "toggle_mute",
        "desc": "Toggle mute/unmute of video clip",
        "params": [
            {"name": "entityId", "type": "string", "desc": "ID of video clip", "default": None, "required": True}
        ]
    },
    {
        "cmd": "set_volume",
        "desc": "Set volume of video clip. If volume_left or volume_right param is set, stereo mode is used",
        "params": [
            {"name": "entityId", "type": "string", "desc": "ID of video clip", "default": None, "required": True},
            {"name": "volume", "type": "number", "desc": "Volume to set. Ignored if volume_left or volume_right is set", "default": 0, "required": False},
            {"name": "volume_left", "type": "number", "desc": "Volume to set left speaker to (if stereo mode is used)", "default": 0, "required": False},
            {"name": "volume_right", "type": "number", "desc": "Volume to set right speaker to (if stereo mode is used)", "default": 0, "required": False},
        ]
    }
]
