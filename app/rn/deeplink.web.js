import parse from './deeplink-parse';

const params = parse(window.location);

export const getUrlParams = () => Promise.resolve(params);
