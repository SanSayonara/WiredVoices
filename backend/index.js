const config = require('./config.json');
const Server = require('./Server');

const serverInstance = new Server(config);

serverInstance.start();
