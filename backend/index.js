const uWebSockets = require('uWebSockets.js');
const log4js = require('log4js');
const msgpackr = require('msgpackr');
const sanitizeHtml = require('sanitize-html');

const { getTimestamp } = require('./utils');

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
  upgrade: async (res, req, context) => {
    const url = req.getUrl();
    const secWebSocketKey = req.getHeader('sec-websocket-key');
    const secWebSocketProtocol = req.getHeader('sec-websocket-protocol');
    const secWebSocketExtensions = req.getHeader('sec-websocket-extensions');
    const upgradeAborted = { aborted: false };

    res.onAborted(() => {
      upgradeAborted.aborted = true;
    });

    logger.info(`The IP ${textDecoder.decode(res.getRemoteAddressAsText())} is trying to establish a WS connection.`);

    if (upgradeAborted.aborted) {
      logger.info(`The IP ${textDecoder.decode(res.getRemoteAddressAsText())} disconnected before we could upgrade it.`);
      return;
    }

    res.upgrade(
      {
        lastMessageTimestamp: 0,
        url,
      },
      secWebSocketKey,
      secWebSocketProtocol,
      secWebSocketExtensions,
      context,
    );
  },
  open: (ws) => {
    ws.subscribe('broadcast');

    logger.info(`New connection from ${textDecoder.decode(ws.getRemoteAddressAsText())}`);
  },
  message: (ws, message) => {
    if (getTimestamp() - ws.lastMessageTimestamp < 2) {
      return;
    }

    // eslint-disable-next-line no-param-reassign
    ws.lastMessageTimestamp = getTimestamp();

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
