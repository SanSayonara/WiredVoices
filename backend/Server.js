/* eslint-disable max-len */
const uWebSockets = require('uWebSockets.js');
const Redis = require('ioredis').default;
const log4js = require('log4js');
const msgpackr = require('msgpackr');
const sanitizeHtml = require('sanitize-html');

const { getTimestamp } = require('./utils');

const sanitizerConfig = {
  allowedTags: [],
  allowedAttributes: {},
};

const textDecoder = new TextDecoder('utf-8');

class Server {
  constructor(config) {
    this.config = config;

    log4js.configure({
      appenders: { out: { type: 'stdout' } },
      categories: { default: { appenders: ['out'], level: this.config.logLevel } },
      pm2: true,
    });

    this.logger = log4js.getLogger();
    this.redis = new Redis(this.config.redis.connectionData);
    this.subscribedRedis = new Redis(this.config.redis.connectionData);
    this.server = uWebSockets.App();

    this.server.ws('/*', {
      idleTimeout: this.config.idleTimeout,
      maxBackpressure: this.config.maxMessagesOnBackpressure * this.config.maxPayloadSize,
      maxPayloadLength: this.config.maxPayloadSize,
      sendPingsAutomatically: true,
      upgrade: this.handleUpgrade.bind(this),
      open: this.handleOpen.bind(this),
      message: this.handleClientMessage.bind(this),
    });
  }

  /**
   * It upgrades the connection to a WebSocket connection
   * @param {uWebSockets.HttpResponse} res - The response object.
   * @param {uWebSockets.HttpRequest} req - The request object.
   * @param {uWebSockets.us_socket_context_t} context - This is the context that was passed to the server when it was created.
   */
  handleUpgrade(res, req, context) {
    const url = req.getUrl();
    const secWebSocketKey = req.getHeader('sec-websocket-key');
    const secWebSocketProtocol = req.getHeader('sec-websocket-protocol');
    const secWebSocketExtensions = req.getHeader('sec-websocket-extensions');
    const upgradeAborted = { aborted: false };

    res.onAborted(() => {
      upgradeAborted.aborted = true;
    });

    this.logger.info(`The IP ${textDecoder.decode(res.getRemoteAddressAsText())} is trying to establish a WS connection.`);

    if (upgradeAborted.aborted) {
      this.logger.info(`The IP ${textDecoder.decode(res.getRemoteAddressAsText())} disconnected before we could upgrade it.`);
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
  }

  /**
   * Called when a connection is established.
   * @param {uWebSockets.WebSocket} ws - The WebSocket connection.
   */
  handleOpen(ws) {
    ws.subscribe('broadcast');

    this.logger.info(`New connection from ${textDecoder.decode(ws.getRemoteAddressAsText())}`);
  }

  /**
   * Handles incoming messages from the client.
   * @param {uWebSockets.WebSocket} ws - The WebSocket connection object.
   * @param {ArrayBuffer} message - The message received from the client.
   */
  handleClientMessage(ws, message) {
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

    this.logger.debug(`Received message from client: ${content}`);

    // this.server.publish('broadcast', msgpackr.encode({ content }), true);

    this.redis.publish(`${this.config.redis.prefix}:broadcast`, msgpackr.encode({ type: 'clientMessage', content }));
  }

  broadcastMessage(content) {
    this.logger.debug(`Broadcasting message: ${content}`);
    this.server.publish('broadcast', msgpackr.encode({ content }), true);
  }

  /**
   * It handles received messages from Redis.
   * @param channel - The channel the message was published to.
   * @param message - The message that was received from the Redis server.
   */
  handleRedisMessage(channel, message) {
    const messageObj = msgpackr.decode(message);

    switch (messageObj.type) {
      case 'clientMessage':
        this.broadcastMessage(messageObj.content);
        break;
      default:
        this.logger.error(`Unknown message type: ${messageObj.type}`);
    }
  }

  async start() {
    try {
      await this.subscribedRedis.subscribe(`${this.config.redis.prefix}:broadcast`);

      this.subscribedRedis.on('messageBuffer', this.handleRedisMessage.bind(this));

      this.server.listen(this.config.port, (listenSocket) => {
        if (listenSocket) {
          this.logger.info(`Server listening on port ${this.config.port}`);
        }
      });
    } catch (e) {
      this.logger.error(e);
    }
  }
}

module.exports = Server;
