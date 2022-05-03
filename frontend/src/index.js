import { generateRandomFontSize, getRandomCoordinates, getTimestamp } from './utils';
import { body, screen, instructionsDOM, messageFormContainer, messageForm, messageFormInput } from './selectors';

import './styles/animations.scss';
import './styles/main.scss';
import './styles/form.scss';

let shortcutsEnabled = true;

let messagesToDeleteList = [];

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
}

messageFormInput.onfocus = (event) => shortcutsEnabled = false;
messageFormInput.onblur = (event) => shortcutsEnabled = true;

messageForm.onsubmit = event => {
  event.preventDefault(), console.log(event)
};

function messageHandler(text) {
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

  messagesToDeleteList.forEach(message => {
    if (now - message.timestamp > 3) {
      const index = messagesToDeleteList.indexOf(message);
  
      message.remove();
      messagesToDeleteList.splice(index, 1);
    }
  });
}

setInterval(garbageCollector, 1000);

window.messageHandler = messageHandler;