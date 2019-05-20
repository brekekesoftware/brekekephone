import get from 'lodash/get';
import FCM, { FCMEvent } from 'react-native-fcm';

import openCustomNoti from './pn-openCustomNoti';
import parseCustomNoti from './pn-parseCustomNoti';

const { Notification, RefreshToken, DirectChannelConnectionChanged } = FCMEvent;

let fcmPnToken = '';
const getPnToken = () => {
  return Promise.resolve(fcmPnToken);
};

const registerPn = () => {
  //
  FCM.requestPermissions({
    badge: false,
    sound: true,
    alert: true,
  }).catch(onFcmError);
  //
  FCM.createNotificationChannel({
    id: 'brekeke_phone',
    name: 'Brekeke Phone',
    description: 'Brekeke Phone notifcation channel',
    priority: 'high',
  }).catch(onFcmError);
  //
  FCM.getFCMToken()
    .then(onFcmToken)
    .catch(onFcmError);
  FCM.on(RefreshToken, onFcmToken); // No off
  //
  FCM.enableDirectChannel();
  FCM.on(DirectChannelConnectionChanged, onDirectChannelChanged); // No off
  //
  FCM.on(Notification, onFcmNotification);
};

const onFcmToken = token => {
  fcmPnToken = token;
};
const onDirectChannelChanged = data => {
  // TODO
};

const onFcmNotification = noti => {
  //
  const customNoti = parseCustomNoti(noti);
  //
  const title =
    get(customNoti, 'body') ||
    // Add fallback to see the detail notification if there's no body
    JSON.stringify(noti);
  const body = /call/.test(title) ? 'Answer' : 'View';
  FCM.presentLocalNotification({
    title,
    body,
    priority: 'high',
    show_in_foreground: false,
    wake_screen: true,
    ongoing: true,
    lights: true,
    sound: 'incallmanager_ringtone.mp3',
  });
  //
  openCustomNoti(customNoti);
};

const onFcmError = err => {
  console.error(err);
};

export { getPnToken, registerPn };
