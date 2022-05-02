import './styles/animations.scss';
import './styles/main.scss';
import './styles/form.scss';

let shortcutsEnabled = true;

let messagesToDeleteList = [];

const viewportHeight = window.innerHeight;
const viewportWidth = window.innerWidth;

const body = document.body;
const instructionsDOM = document.querySelector('#instructions');
const messageFormContainer = document.querySelector('.messageFormContainer')
const messageForm = document.querySelector('#messageForm');
const messageFormInput = document.querySelector('#messageInput');

const instructionsFontSize = viewportWidth / instructionsDOM.innerHTML.length;

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
