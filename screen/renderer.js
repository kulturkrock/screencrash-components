
// Init command handler
let CommandRouter = require('./model/commandrouter');
let commandRouter = new CommandRouter(document);

// Init connection to core
let Connection = require('./model/coreconnection');
let coreConnection = new Connection("ws://localhost:3000/", commandRouter.handleMessage.bind(commandRouter));