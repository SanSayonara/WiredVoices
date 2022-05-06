const uWebSockets = require('uWebSockets.js');
const log4js = require('log4js');
const msgpackr = require('msgpackr');
const sanitizeHtml = require('sanitize-html');

const config = require('./config.json');

log4js.configure({
  appenders: { out: { type: 'stdout' } },
  categories: { default: { appenders: ['out'], level: config.logLevel } },
  pm2: true,
});

const sanitizerConfig = {
  allowedTags: [],
  allowedAttributes: {},
};

const textDecoder = new TextDecoder('utf-8');
const logger = log4js.getLogger();

const server = uWebSockets.App();

server.ws('/*', {
  idleTimeout: config.idleTimeout,
  maxBackpressure: config.maxMessagesOnBackpressure * config.maxPayloadSize,
  maxPayloadLength: config.maxPayloadSize,
  sendPingsAutomatically: true,
  open: (ws) => {
    ws.subscribe('broadcast');

    logger.info(`New connection from ${textDecoder.decode(ws.getRemoteAddressAsText())}`);
  },
  message: (ws, message) => {
    const messageObj = msgpackr.decode(Buffer.from(message));

    if (!messageObj.content) {
      return;
    }

    const content = sanitizeHtml(String(messageObj.content), sanitizerConfig);

    if (content.length > 140) {
      return;
    }

    logger.debug(`Received message: ${content}`);

    server.publish('broadcast', msgpackr.encode({ content }), true);
  },
});

server.listen(config.port, (listenSocket) => {
  if (listenSocket) {
    logger.info(`Server listening on port ${config.port}`);
  }
});
