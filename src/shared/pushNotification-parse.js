import get from 'lodash/get';
import { AppState, Platform } from 'react-native';

import authStore from '../shared/authStore';

const keysInCustomNotification = [
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

const _parse = (...p) =>
  p
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
      keysInCustomNotification.forEach(k => {
        const v = i[k];
        if (!(k in m) && v) {
          m[k] = v;
        }
      });
      return m;
    }, {});

const parse = n => {
  if (authStore.profile && AppState.currentState === 'active') {
    return null;
  }
  //
  let c = {};
  if (Platform.OS === 'android') {
    c = _parse(
      n,
      get(n, 'fcm'),
      get(n, 'data'),
      get(n, 'alert'),
      get(n, 'data.alert'),
      get(n, 'custom_notification'),
      get(n, 'data.custom_notification'),
    );
  } else if (Platform.OS === 'ios') {
    c = _parse(
      n,
      get(n, '_data'),
      get(n, '_alert'),
      get(n, '_data.custom_notification'),
    );
  }
  //
  if (!c.body) {
    c.body = c.message || c.title;
  }
  if (!c.body && !c.to) {
    return null;
  }
  //
  if (
    n.my_custom_data ||
    n.is_local_notification ||
    c.my_custom_data ||
    c.is_local_notification
  ) {
    return null;
  }
  //
  authStore.signinByNotification(c);
  return c;
};

export default parse;
