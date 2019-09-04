import FCM, { FCMEvent } from 'react-native-fcm';

import AsyncStorage from '../shared/AsyncStorage';
import parseCustomNoti from './pushNotification-parse';

const { Notification, RefreshToken } = FCMEvent;

let fcmPnToken = '';

const getPushNotificationToken = () => {
  return Promise.resolve(fcmPnToken);
};

const registerPushNotification = async () => {
  try {
    await FCM.requestPermissions();
    FCM.enableDirectChannel();
    //
    await FCM.createNotificationChannel({
      id: 'default',
      name: 'Brekeke Phone',
      description: 'Brekeke Phone notification channel',
      priority: 'low',
    });
    //
    FCM.on(RefreshToken, onFcmToken);
    FCM.on(Notification, onFcmNotification);
    await FCM.getFCMToken().then(onFcmToken);
    const noti = await FCM.getInitialNotification();
    onFcmNotification(noti);
  } catch (err) {
    console.error('pushNotification.android:registerPushNotification:', err);
  }
};

const onFcmToken = token => {
  if (token) {
    fcmPnToken = token;
  }
};

const onFcmNotification = async noti => {
  const n = noti && parseCustomNoti(noti);
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
    priority: 'low',
    show_in_foreground: true,
    local_notification: true,
    wake_screen: true,
    ongoing: false,
    lights: true,
    channel: 'default',
    icon: 'ic_launcher',
    my_custom_data: 'local_notification',
    is_local_notification: 'local_notification',
  });
};

const getBadgeNumber = async () => {
  let n = await AsyncStorage.getItem('androidBadgeNumber');
  if (typeof n === 'string') {
    n = n.replace(/\D+/g, '');
  }
  return parseInt(n) || 0;
};

const setBadgeNumber = n => {
  AsyncStorage.setItem('androidBadgeNumber', '' + n);
};

const resetBadgeNumber = () => {
  setBadgeNumber(0);
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

export { getPushNotificationToken, registerPushNotification, resetBadgeNumber };
