import { Linking } from 'react-native';

import { getCurrentAuthProfile } from '../components/pbx-auth/getset';
import { getProfilesManager } from '../components/profiles-manage/getset';
import * as routerUtils from '../mobx/routerStore';
import parse from './deeplink-parse';

// App opened in background mode via Linking
let alreadyHandleFirstOpen = false;
let urlParams = null;

export const getUrlParams = () => {
  if (alreadyHandleFirstOpen) {
    return Promise.resolve(urlParams);
  }
  alreadyHandleFirstOpen = true;
  return Linking.getInitialURL().then(parse);
};
export const setUrlParams = p => {
  urlParams = p;
};

Linking.addEventListener('url', e => {
  //
  const p = (urlParams = parse(e.url));
  if (!p) {
    return;
  }
  const u = getCurrentAuthProfile();
  const c = (v1, v2) => !v1 || !v2 || v1 === v2; // compare
  //
  // If the params links to current authenticated user
  //    => don't handle
  if (
    u &&
    p.user && // must have user
    c(p.host, u.pbxHostname) &&
    c(p.port, u.pbxPort) &&
    c(p.user, u.pbxUsername) &&
    c(p.tenant, u.pbxTenant)
  ) {
    return;
  }
  const pm = getProfilesManager();
  if (pm) {
    pm.handleUrlParams();
  } else {
    routerUtils.goToProfilesManage();
  }
});
