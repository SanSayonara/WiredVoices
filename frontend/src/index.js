import './styles/animations.scss';
import './styles/main.scss';
import './styles/form.scss';

let messagesToDeleteList = [];

const viewportHeight = window.innerHeight;
const viewportWidth = window.innerWidth;

const instructionsDOM = document.querySelector('#instructions');
const messageForm = document.querySelector('#messageForm');

const instructionsFontSize = viewportWidth / instructionsDOM.innerHTML.length;

instructionsDOM.style.fontSize = `${instructionsFontSize}px`;

messageForm.onsubmit = event => {
    event.preventDefault(), console.log(event)
};
