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
  const customNoti = parseCustomNoti(noti);
  openCustomNoti(customNoti);
};

const onFcmError = err => {
  console.error(err);
};

export { getPnToken, registerPn };
