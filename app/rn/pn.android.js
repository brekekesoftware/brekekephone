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
    //
    FCM.enableDirectChannel();
    await FCM.createNotificationChannel({
      id: 'default',
      name: 'Brekeke Phone',
      description: 'Brekeke Phone notification channel',
      priority: 'high',
    });
    //
    // Register with no remove
    FCM.on(RefreshToken, onFcmToken);
    FCM.on(Notification, onFcmNotification);
    //
    await FCM.getFCMToken().then(onFcmToken);
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
  const title = n.body || JSON.stringify(n);
  const isCall = /call/i.test(title);
  const body = 'Click to ' + (isCall ? 'answer' : 'view');
  const sound = isCall ? 'incallmanager_ringtone.mp3' : undefined;
  const badge = (await getBadgeNumber()) + 1;
  //
  FCM.presentLocalNotification({
    body,
    title,
    sound,
    number: badge,
    priority: 'high',
    show_in_foreground: true,
    local_notification: true,
    wake_screen: true,
    ongoing: true,
    lights: true,
    channel: 'default',
    icon: 'ic_launcher',
    my_custom_data: 'local_notification',
    is_local_notification: 'local_notification',
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
    local_notification: true,
    wake_screen: false,
    ongoing: false,
    lights: false,
    channel: 'default',
    icon: 'ic_launcher',
    my_custom_data: 'local_notification',
    is_local_notification: 'local_notification',
  });
};
