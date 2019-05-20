import { Linking } from 'react-native';

import * as routerUtils from '../mobx/routerStore';
import { getCurrentAuthProfile } from '../modules/pbx-auth/getset';
import { getProfileManager } from '../modules/profiles-manage/getset';
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
  const p = urlParams = parse(e.url);
  const u = getCurrentAuthProfile();
  const c = (v1, v2) => !v1 || !v2 || v1 === v2; // compare
  //
  // If the params links to current authenticated user
  //    => don't handle
  if (
    p &&
    u &&
    c(p.host, u.pbxHostname) &&
    c(p.port, u.pbxPort) &&
    c(p.user, u.pbxUsername) &&
    c(p.tenant, u.pbxTenant)
  ) {
    return;
  }
  const pm = getProfileManager();
  if (pm) {
    pm.handleUrlParams();
  } else {
    routerUtils.goToProfilesManage();
  }
});
