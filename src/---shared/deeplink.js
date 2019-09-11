import { Linking } from 'react-native';

import authStore, { compareProfile } from './authStore';
import parse from './deeplink-parse';

let alreadyHandleFirstOpen = false;
let urlParams = null;

const getUrlParams = () => {
  if (alreadyHandleFirstOpen) {
    return Promise.resolve(urlParams);
  }
  alreadyHandleFirstOpen = true;
  return Linking.getInitialURL().then(parse);
};

const setUrlParams = p => {
  urlParams = p;
};

Linking.addEventListener('url', e => {
  const p = (urlParams = parse(e.url));
  // Check against the current user
  if (
    !p ||
    !authStore.profile ||
    compareProfile(authStore.profile, {
      pbxHostname: p.host,
      pbxPort: p.port,
      pbxUsername: p.user,
      pbxTenant: p.tenant,
    })
  ) {
    return;
  }
  authStore.handleUrlParams();
});

export { getUrlParams, setUrlParams };
