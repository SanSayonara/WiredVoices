import _ from "lodash";
import { LoremIpsum } from "lorem-ipsum";

const lorem = new LoremIpsum();
let intervalRef = null;

const randomMessageGenerator = () => {
    return window.messageHandler(lorem.generateWords(_.random(1, 10)));
}

window.startRandomMessageGenerator = (miliseconds = 10) => {
    intervalRef = setInterval(randomMessageGenerator, miliseconds);
}

window.stopRandomMessageGenerator = () => {
    clearInterval(intervalRef);
}