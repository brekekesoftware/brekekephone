import get from 'lodash/get';
import { AppState, Platform } from 'react-native';

import {
  getProfilesManager,
  getProfilesManagerInterval,
} from '../components/profiles-manage/getset';
import authStore from '../mobx/authStore';
import * as routerUtils from '../mobx/routerStore';

const keysInCustomNoti = [
  'body',
  'message',
  'title',
  'tenant',
  'to',
  'pbxHostname',
  'pbxPort',
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
  const u = authStore.profile;

  if (u && AppState.currentState === 'active') {
    return null;
  }

  let c = {};

  if (Platform.OS === 'android') {
    c = parse(
      n,
      get(n, 'fcm'),
      get(n, 'data'),
      get(n, 'alert'),
      get(n, 'data.alert'),
      get(n, 'custom_notification'),
      get(n, 'data.custom_notification'),
    );
  } else if (Platform.OS === 'ios') {
    c = parse(
      n,
      get(n, '_data'),
      get(n, '_alert'),
      get(n, '_data.custom_notification'),
    );
  }

  if (!c.body) {
    c.body = c.message || c.title;
  }

  if (!c.body && !c.to) {
    return null;
  }

  if (
    n.my_custom_data ||
    n.is_local_notification ||
    c.my_custom_data ||
    c.is_local_notification
  ) {
    return null;
  }

  const pm = getProfilesManager();

  if (pm) {
    pm.signinByCustomNoti(c);
  } else if (!u) {
    routerUtils.goToProfilesManage();

    getProfilesManagerInterval().then(pm => {
      if (pm) {
        pm.signinByCustomNoti(c);
      }
    });
  }

  return c;
};

export default parseCustomNoti;
