const { ipcRenderer } = require('electron');

const path = require('path');

// Workaround: On some computers the audio system may go to sleep and
// take a short while to activate. This can cut off the beginning of
// clips, so we "play" a looping silent sound to prevent this.
if (process.env.SCREENCRASH_NO_AUDIO !== 'true') {
    const audioDiv = document.createElement('div');
    audioDiv.innerHTML = '<audio class="audio-media hidden" src="silence.wav" autoplay loop></audio>';
    document.body.appendChild(audioDiv);
}

// Init command handler
const CommandRouter = require('./model/commandrouter');
const FileHandler = require('./model/fileHandler');
const resourcesPath = path.join(__dirname, 'resources');
const fileHandler = new FileHandler(resourcesPath);
const commandRouter = new CommandRouter(document, fileHandler);

// Init connection to core
const Connection = require('./model/coreconnection');
// eslint-disable-next-line no-unused-vars
const coreConnection = new Connection(
    `ws://${process.env.SCREENCRASH_CORE || 'localhost:8001'}/`,
    commandRouter.initialMessage.bind(commandRouter),
    commandRouter.handleMessage.bind(commandRouter)
);
commandRouter.init(coreConnection.send.bind(coreConnection));
commandRouter.addEventListener('relaunch', () => {
    ipcRenderer.send('relaunch-app');
});
