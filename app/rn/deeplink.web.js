import parse from './deeplink-parse';

let alreadyHandleFirstOpen = false;
const params = parse(window.location);

export const getUrlParams = () => {
  if (alreadyHandleFirstOpen) {
    return Promise.resolve(null);
  }
  alreadyHandleFirstOpen = true;
  return Promise.resolve(params);
};
// polyfill for native ./deeplink.js
export const setUrlParams = () => {
  return;
};
