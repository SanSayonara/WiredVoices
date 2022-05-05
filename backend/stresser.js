/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
const WebSocket = require('ws');
const msgpackr = require('msgpackr');
const _ = require('lodash');
const { LoremIpsum } = require('lorem-ipsum');

const config = require('./config.json');

const lorem = new LoremIpsum();

const maxConnections = 100;
const millisecondsPerMessage = 100;
const webSocketConnections = [];

const stresser = () => {
  const randomConnection = _.sample(webSocketConnections);

  if (!randomConnection) {
    return;
  }

  const randomMessage = lorem.generateSentences(1);

  console.log(`Sending message: ${randomMessage}`);

  randomConnection.send(msgpackr.encode({ content: randomMessage }));
};

const startStressing = () => {
  setInterval(stresser, millisecondsPerMessage);
};

for (let i = 0; i < maxConnections; i += 1) {
  const ws = new WebSocket(`ws://localhost:${config.port}`);

  if (maxConnections - 1 === i) {
    ws.onopen = () => {
      webSocketConnections.push(ws);
      startStressing();
    };
  } else {
    ws.onopen = () => {
      webSocketConnections.push(ws);
    };
  }
}
