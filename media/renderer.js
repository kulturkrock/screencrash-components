const path = require('path');
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
