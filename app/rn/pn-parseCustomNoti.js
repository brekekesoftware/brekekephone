import get from 'lodash/get';
import { AppState, AsyncStorage, Platform } from 'react-native';

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

const parseCustomNoti = noti => {
  if (AppState.currentState === 'active') {
    return null;
  }
  //
  let customNoti = {};
  if (Platform.OS === 'android') {
    customNoti = noti;
    // TODO
  } else if (Platform.OS === 'ios') {
    customNoti = parse(
      get(noti, '_alert'), // UC message TODO
      get(noti, '_data.custom_notification'),
    );
  }
  customNoti.receivedAt = new Date();
  //
  AsyncStorage.setItem('lastNotification', JSON.stringify(customNoti));
  return customNoti;
};

export default parseCustomNoti;
