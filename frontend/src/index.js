/* eslint-disable no-return-assign */
import _ from 'lodash';
import { encode, decode } from 'msgpackr';
import { generateRandomFontSize, getRandomCoordinates, getTimestamp } from './utils';
import {
  body, screen, instructionsDOM, messageFormContainer, messageForm, messageFormInput, lainElement,
} from './selectors';

import lainImages from './lainImages.json';

import './styles/animations.scss';
import './styles/main.scss';
import './styles/form.scss';

let server = null;
let shortcutsEnabled = true;

const messagesNodes = [];
const messagesNodesToRecycle = [];

const instructionsFontSize = window.innerWidth / instructionsDOM.innerHTML.length;

instructionsDOM.style.fontSize = `${instructionsFontSize}px`;

body.onkeyup = (event) => {
  const { key } = event;

  if (!shortcutsEnabled) {
    return;
  }

  if (key.toLowerCase() === 't') {
    messageFormContainer.classList.toggle('showMessageForm');
  }
};

messageFormInput.onfocus = () => shortcutsEnabled = false;
messageFormInput.onblur = () => shortcutsEnabled = true;

messageForm.onsubmit = (event) => {
  event.preventDefault();

  const message = messageFormInput.value;
  messageFormInput.value = '';

  if (server?.readyState) {
    server.send(encode({ content: message }));
    messageFormContainer.classList.remove('showMessageForm');
  }
};

function createMessageNode() {
  const messageNode = document.createElement('div');
  messageNode.classList.add('message');
  messageNode.addEventListener('animationend', () => {
    messageNode.classList.remove('showMessageAnimation');
    messageNode.remove();

    messagesNodesToRecycle.push(messageNode);
  });
  messagesNodes.push(messageNode);

  return messageNode;
}

function messageCreator(text) {
  let messageNode = null;
  const fontSize = generateRandomFontSize();

  if (messagesNodesToRecycle.length) {
    messageNode = messagesNodesToRecycle.pop();
  } else {
    messageNode = createMessageNode();
  }

  messageNode.innerHTML = text;
  messageNode.classList.add('message');
  messageNode.style.fontSize = `${fontSize}px`;

  screen.appendChild(messageNode);

  const { x, y } = getRandomCoordinates(messageNode);

  messageNode.style.left = `${x}px`;
  messageNode.style.top = `${y}px`;
  messageNode.classList.add('showMessageAnimation');
  messageNode.timestamp = getTimestamp();
}

function connectToServer() {
  server = new WebSocket('ws://localhost:9001');
  server.binaryType = 'arraybuffer';

  server.onmessage = ({ data }) => {
    const message = decode(new Uint8Array(data));

    messageCreator(message.content);
  };
}

lainElement.onload = () => {
  const { x, y } = getRandomCoordinates(lainElement);

  lainElement.style.left = `${x}px`;
  lainElement.style.top = `${y}px`;
  lainElement.classList.add('showLainAnimation');
};

const showLain = () => {
  const randomImage = _.sample(lainImages);

  lainElement.src = randomImage;
};

lainElement.addEventListener('animationend', () => lainElement.classList.remove('showLainAnimation'));

setInterval(showLain, 5 * 60 * 1000);

connectToServer();

window.messageHandler = messageCreator;
