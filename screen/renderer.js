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
    `ws://${process.env.CORE || 'localhost:3000'}/`,
    commandRouter.initialMessage.bind(commandRouter),
    commandRouter.handleMessage.bind(commandRouter)
);

// TODO: Do we need to save a reference to the core connection? It seems to handle itself rather nicely already.
//       I left it there for future potential features with replacing core address etc.
