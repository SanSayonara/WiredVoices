import _ from 'lodash';

export const generateRandomFontSize = () => {
  const minRange = Math.max(window.innerWidth * 0.01, 16);
  const maxRange = window.innerWidth * 0.04;

  return _.random(minRange, maxRange);
};

export const getRandomCoordinates = (element) => {
  const x = _.random(0, window.innerWidth - element.clientWidth);
  const y = _.random(0, window.innerHeight - element.clientHeight);

  return { x, y };
};

export const getTimestamp = () => Math.round((new Date()).getTime() / 1000);
