import get from 'lodash/get';
import FCM, { FCMEvent } from 'react-native-fcm';

import openCustomNoti from './pn-openCustomNoti';
import parseCustomNoti from './pn-parseCustomNoti';

const { Notification, RefreshToken } = FCMEvent;

let fcmPnToken = '';
export const getPnToken = () => {
  return Promise.resolve(fcmPnToken);
};

export const registerPn = async () => {
  try {
    //
    await FCM.requestPermissions();
    await FCM.getFCMToken().then(onFcmToken);
    //
    await FCM.createNotificationChannel({
      id: 'brekeke_phone',
      name: 'Brekeke Phone',
      description: 'Brekeke Phone notifcation channel',
      priority: 'high',
    });
    //
    // Register with no remove
    FCM.on(RefreshToken, onFcmToken);
    FCM.on(Notification, onFcmNotification);
  } catch (err) {
    console.error('pn.android.registerPn:', err);
  }
};

const onFcmToken = token => {
  fcmPnToken = token;
};

const onFcmNotification = noti => {
  //
  const customNoti = parseCustomNoti(noti);
  openCustomNoti(customNoti);
  //
  const body =
    get(customNoti, 'body') ||
    // Add fallback to see the detail notification if there's no body
    JSON.stringify(noti);
  const isCall = /call/.test(body);
  const title = isCall ? 'Answer' : 'View';
  const sound = isCall ? 'incallmanager_ringtone.mp3' : undefined;
  //
  FCM.presentLocalNotification({
    body,
    title,
    sound,
    number: 1,
    priority: 'high',
    show_in_foreground: false,
    wake_screen: true,
    ongoing: true,
    lights: true,
  });
};
