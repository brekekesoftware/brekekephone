import { AsyncStorage } from 'react-native';
import FCM, { FCMEvent } from 'react-native-fcm';

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

const onFcmNotification = async noti => {
  const n = parseCustomNoti(noti);
  if (!n) {
    return;
  }
  //
  const body = n.body || JSON.stringify(n);
  const isCall = /call/i.test(body);
  const title = isCall ? 'Answer' : 'View';
  const sound = isCall ? 'incallmanager_ringtone.mp3' : undefined;
  const badge = (await getBadgeNumber()) + 1;
  //
  FCM.presentLocalNotification({
    body,
    title,
    sound,
    number: badge,
    priority: 'high',
    show_in_foreground: false,
    wake_screen: true,
    ongoing: true,
    lights: true,
  });
};

const getBadgeNumber = async () => {
  let n = await AsyncStorage.getItem('androidBadgeNumber');
  return parseInt(n) || 0;
};
const setBadgeNumber = n => {
  AsyncStorage.setItem('androidBadgeNumber', n);
};
export const resetBadgeNumber = () => {
  setBadgeNumber(0);
  //
  // Call presentLocalNotification to reset badge?
  FCM.presentLocalNotification({
    body: 'Reset badge',
    number: 0,
    priority: 'low',
    show_in_foreground: false,
    wake_screen: false,
    ongoing: false,
    lights: false,
  });
};
