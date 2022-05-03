import _ from 'lodash';
import { viewportWidth, viewportHeight } from "./selectors"

export const generateRandomFontSize = () => {
  const minRange = Math.max(viewportWidth * 0.01, 16);
  const maxRange = viewportWidth * 0.04;

  return _.random(minRange, maxRange);
}

export const getRandomCoordinates = (element) => {
  const x = _.random(0, viewportWidth - element.clientWidth);
  const y = _.random(0, viewportHeight - element.clientHeight);

  return { x, y };
}