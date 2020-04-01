import './callkeep';

import FCM, { FCMEvent } from 'react-native-fcm';

import { AppRegistry, AsyncStorage } from '../Rn';
import parse from './PushNotification-parse';

const { Notification, RefreshToken } = FCMEvent;

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

let fcmPnToken = '';
const onToken = t => {
  if (t) {
    fcmPnToken = t;
  }
};
const onNotification = async n => {
  n = await parse(n);
  if (!n) {
    return;
  }
  //
  const badge = (await getBadgeNumber()) + 1;
  await setBadgeNumber(badge);
  //
  FCM.presentLocalNotification({
    body: 'Click to ' + (n.isCall ? 'answer' : 'view'),
    title: n.title || n.body,
    sound: n.isCall ? 'incallmanager_ringtone.mp3' : undefined,
    number: badge,
    priority: 'high',
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

const PushNotification = {
  getToken: () => {
    return Promise.resolve(fcmPnToken);
  },
  register: async () => {
    try {
      await FCM.requestPermissions();
      FCM.enableDirectChannel();
      await FCM.createNotificationChannel({
        id: 'default',
        name: 'Brekeke Phone',
        description: 'Brekeke Phone notification channel',
        priority: 'high',
      });
      FCM.on(RefreshToken, onToken);
      FCM.on(Notification, onNotification);
      await FCM.getFCMToken().then(onToken);
      const n = await FCM.getInitialNotification();
      onNotification(n);
    } catch (err) {
      console.error('Failed to register push notification', err);
    }
  },
  resetBadgeNumber: () => {
    setBadgeNumber(0);
    FCM.presentLocalNotification({
      body: 'Reset badge',
      number: 0,
      priority: 'high',
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
  },
};

// TODO
AppRegistry.registerHeadlessTask(
  'RNCallKeepBackgroundMessage',
  () => ({ callUUID, handle, name }) => {
    // https://github.com/react-native-webrtc/react-native-callkeep/blob/master/docs/android-installation.md
    return Promise.resolve();
  },
);

export default PushNotification;
