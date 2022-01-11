
const genericCommands = [
    {
        cmd: 'file',
        desc: 'Store file to resource folder',
        params: [
            { name: 'path', type: 'string', desc: 'Relative path to asset', default: null, required: true },
            { name: 'data', type: 'raw', desc: 'Base64 raw data of file', default: null, required: true }
        ]
    },
    {
        cmd: 'show',
        desc: 'Set media to visible',
        params: [
            { name: 'entityId', type: 'string', desc: 'ID of media', default: null, required: true }
        ]
    },
    {
        cmd: 'hide',
        desc: 'Set media to not visible',
        params: [
            { name: 'entityId', type: 'string', desc: 'ID of media', default: null, required: true }
        ]
    },
    {
        cmd: 'opacity',
        desc: 'Set opacity of media',
        params: [
            { name: 'entityId', type: 'string', desc: 'ID of media', default: null, required: true },
            { name: 'opacity', type: 'number', desc: 'Opacity of element as a number between 0.0 (transparent) to 1.0 (fully opaque)', default: 1.0, required: true }
        ]
    },
    {
        cmd: 'viewport',
        desc: 'Set viewport location and size of media',
        params: [
            { name: 'entityId', type: 'string', desc: 'ID of media', default: null, required: true },
            { name: 'x', type: 'number', desc: 'Position of media element along X-axis', default: 'Ignored if not set', required: false },
            { name: 'y', type: 'number', desc: 'Position of media element along Y-axis', default: 'Ignored if not set', required: false },
            { name: 'width', type: 'number', desc: 'Width of media element', default: 'Ignored if not set', required: false },
            { name: 'height', type: 'number', desc: 'Height of media element', default: 'Ignored if not set', required: false },
            { name: 'usePercentage', type: 'boolean', desc: 'If set to false, dimensions and sizes use pixels as unit. Otherwise, uses percentages', default: false, required: false }
        ]
    },
    {
        cmd: 'layer',
        desc: 'Set layer of media',
        params: [
            { name: 'entityId', type: 'string', desc: 'ID of media', default: null, required: true },
            { name: 'layer', type: 'number', desc: 'Layer of media element. Higher layers are drawn on top of lower number', default: 0, required: true }
        ]
    },
    {
        cmd: 'destroy',
        desc: 'Remove media from screen',
        params: [
            { name: 'entityId', type: 'string', desc: 'ID of media', default: null, required: true }
        ]
    }
];

const imageCommands = genericCommands.concat([
    {
        cmd: 'create',
        desc: 'Add an image. This will create an element for the image and load it from file',
        params: [
            { name: 'asset', type: 'string', desc: 'Path to image', default: null, required: true },
            { name: 'entityId', type: 'string', desc: 'ID to reference this media by', default: null, required: true },
            { name: 'x', type: 'number', desc: 'Position of media element along X-axis', default: 'Ignored if not set', required: false },
            { name: 'y', type: 'number', desc: 'Position of media element along Y-axis', default: 'Ignored if not set', required: false },
            { name: 'width', type: 'number', desc: 'Width of media element', default: 'Ignored if not set', required: false },
            { name: 'height', type: 'number', desc: 'Height of media element', default: 'Ignored if not set', required: false },
            { name: 'usePercentage', type: 'boolean', desc: 'If set to false, dimensions and sizes use pixels as unit. Otherwise, uses percentages', default: false, required: false },
            { name: 'opacity', type: 'number', desc: 'Opacity of element as a number between 0.0 (transparent) to 1.0 (fully opaque)', default: 1.0, required: false },
            { name: 'layer', type: 'number', desc: 'Layer of media element. Higher layers are drawn on top of lower number', default: 0, required: false },
            { name: 'visible', type: 'boolean', desc: 'Visibility of media element', default: false, required: false }
        ]
    }
]);

const videoCommands = genericCommands.concat([
    {
        cmd: 'create',
        desc: 'Add a video clip. This will create an element for the clip and load it from file',
        params: [
            { name: 'asset', type: 'string', desc: 'Path to video clip', default: null, required: true },
            { name: 'entityId', type: 'string', desc: 'ID to reference this clip by', default: null, required: true },
            { name: 'looping', type: 'number', desc: 'Number of times to play clip. 0 means inf. times', default: 1, required: false },
            { name: 'autostart', type: 'boolean', desc: 'Starts the clip immediately if set to true', default: true, required: false },
            { name: 'x', type: 'number', desc: 'Position of media element along X-axis', default: 'Ignored if not set', required: false },
            { name: 'y', type: 'number', desc: 'Position of media element along Y-axis', default: 'Ignored if not set', required: false },
            { name: 'width', type: 'number', desc: 'Width of media element', default: 'Ignored if not set', required: false },
            { name: 'height', type: 'number', desc: 'Height of media element', default: 'Ignored if not set', required: false },
            { name: 'usePercentage', type: 'boolean', desc: 'If set to false, dimensions and sizes use pixels as unit. Otherwise, uses percentages', default: false, required: false },
            { name: 'opacity', type: 'number', desc: 'Opacity of element as a number between 0.0 (transparent) to 1.0 (fully opaque)', default: 1.0, required: false },
            { name: 'layer', type: 'number', desc: 'Layer of media element. Higher layers are drawn on top of lower number', default: 0, required: false },
            { name: 'visible', type: 'boolean', desc: 'Visibility of media element', default: false, required: false }
        ]
    },
    {
        cmd: 'play',
        desc: 'Start playback of video clip',
        params: [
            { name: 'entityId', type: 'string', desc: 'ID of video clip', default: null, required: true }
        ]
    },
    {
        cmd: 'pause',
        desc: 'Pause playback of video clip',
        params: [
            { name: 'entityId', type: 'string', desc: 'ID of video clip', default: null, required: true }
        ]
    }
]);

const webCommands = genericCommands.concat([
    {
        cmd: 'create',
        desc: 'Add an iframe web page',
        params: [
            { name: 'asset', type: 'string', desc: 'Path to web page. Could be a http/https link or a file', default: null, required: true },
            { name: 'entityId', type: 'string', desc: 'ID to reference this media by', default: null, required: true },
            { name: 'x', type: 'number', desc: 'Position of media element along X-axis', default: 'Ignored if not set', required: false },
            { name: 'y', type: 'number', desc: 'Position of media element along Y-axis', default: 'Ignored if not set', required: false },
            { name: 'width', type: 'number', desc: 'Width of media element', default: 'Ignored if not set', required: false },
            { name: 'height', type: 'number', desc: 'Height of media element', default: 'Ignored if not set', required: false },
            { name: 'usePercentage', type: 'boolean', desc: 'If set to false, dimensions and sizes use pixels as unit. Otherwise, uses percentages', default: false, required: false },
            { name: 'opacity', type: 'number', desc: 'Opacity of element as a number between 0.0 (transparent) to 1.0 (fully opaque)', default: 1.0, required: false },
            { name: 'layer', type: 'number', desc: 'Layer of media element. Higher layers are drawn on top of lower number', default: 0, required: false },
            { name: 'visible', type: 'boolean', desc: 'Visibility of media element', default: false, required: false }
        ]
    },
    {
        cmd: 'refresh',
        desc: 'Refresh web page. Will set GET parameter "screencrash_web_component_refresh_arg" to avoid caching',
        params: [
            { name: 'entityId', type: 'string', desc: 'ID of web element', default: null, required: true }
        ]
    }
]);

module.exports = { imageCommands, videoCommands, webCommands };
