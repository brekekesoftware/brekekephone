import get from 'lodash/get';
import { AppState, Platform } from 'react-native';

import * as routerUtils from '../mobx/routerStore';
import { getCurrentAuthProfile } from '../modules/pbx-auth/getset';
import {
  getProfilesManager,
  getProfilesManagerInterval,
} from '../modules/profiles-manage/getset';

const keysInCustomNoti = [
  'body',
  'message', // body fallback
  'title', // body fallback
  'tenant',
  'to',
  'pbxHostname',
  'pbxPort',
  // ...
  'my_custom_data',
  'is_local_notification',
];

const parse = (...p) => {
  return p
    .filter(i => !!i)
    .map(i => {
      if (typeof i === 'string') {
        try {
          return JSON.parse(i);
        } catch (err) {}
      }
      return i;
    })
    .reduce((m, i) => {
      if (!i || typeof i !== 'object') {
        return m;
      }
      keysInCustomNoti.forEach(k => {
        const v = i[k];
        if (!(k in m) && v) {
          m[k] = v;
        }
      });
      return m;
    }, {});
};

const parseCustomNoti = n => {
  //
  const u = getCurrentAuthProfile();
  if (u && AppState.currentState === 'active') {
    return null;
  }
  //
  let custom = {};
  if (Platform.OS === 'android') {
    custom = parse(
      n,
      get(n, 'fcm'),
      get(n, 'data'),
      get(n, 'alert'),
      get(n, 'data.alert'),
      get(n, 'custom_notification'),
      get(n, 'data.custom_notification'),
    );
  } else if (Platform.OS === 'ios') {
    custom = parse(
      n,
      get(n, '_data'),
      get(n, '_alert'),
      get(n, '_data.custom_notification'),
    );
  }
  if (!custom.body) {
    custom.body = custom.message || custom.title;
  }
  //
  if (
    n.my_custom_data ||
    n.is_local_notification ||
    custom.my_custom_data ||
    custom.is_local_notification
  ) {
    // Added from ./pn.android
    // TODO handle user click
    return null;
  }
  //
  const pm = getProfilesManager();
  if (pm) {
    pm.signinByCustomNoti(custom);
  } else if (!u) {
    routerUtils.goToProfilesManage();
    getProfilesManagerInterval().then(pm => {
      if (pm) {
        pm.signinByCustomNoti(custom);
      }
    });
  }
  //
  return custom;
};

export default parseCustomNoti;
