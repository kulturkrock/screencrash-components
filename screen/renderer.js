
// Init command handler
const CommandRouter = require("./model/commandrouter");
const commandRouter = new CommandRouter(document);

// Init connection to core
const Connection = require("./model/coreconnection");
// eslint-disable-next-line no-unused-vars
const coreConnection = new Connection("ws://localhost:3000/", commandRouter.handleMessage.bind(commandRouter));

// TODO: Do we need to save a reference to the core connection? It seems to handle itself rather nicely already.
//       I left it there for future potential features with replacing core address etc.
