import get from 'lodash/get';
import { Platform } from 'react-native';

let checker = null;
const setChecker = fn => {
  checker = fn;
};

const keysInCustomNotification = [
  `body`,
  `message`,
  `title`,
  `tenant`,
  `to`,
  `pbxHostname`,
  `pbxPort`,
  `my_custom_data`,
  `is_local_notification`,
];

const _parse = (...p) =>
  p
    .filter(i => !!i)
    .map(i => {
      if (typeof i === `string`) {
        try {
          return JSON.parse(i);
        } catch (err) {}
      }
      return i;
    })
    .reduce((m, i) => {
      if (!i || typeof i !== `object`) {
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

const parse = raw => {
  let n = {};
  if (Platform.OS === `android`) {
    n = _parse(
      raw,
      get(raw, `fcm`),
      get(raw, `data`),
      get(raw, `alert`),
      get(raw, `data.alert`),
      get(raw, `custom_notification`),
      get(raw, `data.custom_notification`),
    );
  } else if (Platform.OS === `ios`) {
    n = _parse(
      raw,
      get(raw, `_data`),
      get(raw, `_alert`),
      get(raw, `_data.custom_notification`),
    );
  } else {
    // TODO handle web
  }
  //
  if (!n.body) {
    n.body = n.message || n.title;
  }
  if (!n.body && !n.to) {
    return null;
  }
  //
  // Local noti from ./PushNotification.android.js
  if (
    raw.my_custom_data ||
    raw.is_local_notification ||
    n.my_custom_data ||
    n.is_local_notification
  ) {
    return null;
  }
  if (checker && !checker(n)) {
    return null;
  }
  //
  return n;
};

export { setChecker };
export default parse;
