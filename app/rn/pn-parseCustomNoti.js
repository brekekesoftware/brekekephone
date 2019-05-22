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
  'tenant',
  'to',
  'pbxHostname',
  'pbxPort',
  // ...
];

const parse = (...p) => {
  return p
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
  if (AppState.currentState === 'active') {
    return null;
  }
  //
  let customNoti = {};
  if (Platform.OS === 'android') {
    customNoti = parse(
      get(n, 'fcm'),
      get(n, 'custom_notification'),
      get(n, 'data.custom_notification'),
    );
  } else if (Platform.OS === 'ios') {
    customNoti = parse(
      get(n, '_alert'), // UC message TODO
      get(n, '_data.custom_notification'),
    );
  }
  //
  const pm = getProfilesManager();
  if (pm) {
    pm.signinByCustomNoti(customNoti);
  } else if (!getCurrentAuthProfile()) {
    routerUtils.goToProfilesManage();
    getProfilesManagerInterval().then(pm => {
      if (pm) {
        pm.signinByCustomNoti(customNoti);
      }
    });
  }
  //
  return customNoti;
};

export default parseCustomNoti;
