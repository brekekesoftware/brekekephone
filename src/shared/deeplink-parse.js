import qs from 'qs';
import Url from 'url-parse';

const parse = location => {
  if (!location) {
    return null;
  }
  if (typeof location === 'string') {
    location = new Url(location, true);
  }
  //
  const params = Object.assign(
    qs.parse(location.hash.replace(/^[^?]*\?*/, '')),
    location.query || qs.parse(location.search.replace(/^\?*/, '')),
  );
  //
  if (params.url) {
    const url = new Url(params.url);
    if (url.hostname) {
      params.host = url.hostname;
    }
    if (url.port) {
      params.port = url.port;
    } else if (/^ws:/.test(params.url)) {
      params.port = '80';
    } else {
      params.port = '443';
    }
  }
  //
  if (!params.host) {
    params.host = location.hostname;
  }
  if (!params.port) {
    params.port = '' + location.port;
  }
  //
  return params;
};

export default parse;
