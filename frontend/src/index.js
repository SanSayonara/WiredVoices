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

let shortcutsEnabled = true;

const messagesToDeleteList = [];

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

  console.log(event);
};

function messageCreator(text) {
  const newElement = document.createElement('div');
  const fontSize = generateRandomFontSize();

  newElement.innerHTML = text;
  newElement.classList.add('message');
  newElement.style.fontSize = `${fontSize}px`;

  screen.appendChild(newElement);

  const { x, y } = getRandomCoordinates(newElement);

  newElement.style.left = `${x}px`;
  newElement.style.top = `${y}px`;
  newElement.timestamp = getTimestamp();

  messagesToDeleteList.push(newElement);
}

const garbageCollector = () => {
  const now = getTimestamp();

  messagesToDeleteList.forEach((message) => {
    if (now - message.timestamp > 3) {
      const index = messagesToDeleteList.indexOf(message);

      message.remove();
      messagesToDeleteList.splice(index, 1);
    }
  });
};

function connectToServer() {
  const server = new WebSocket('ws://localhost:9001');
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
setInterval(garbageCollector, 5000);

connectToServer();

window.messageHandler = messageCreator;
