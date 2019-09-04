import { PushNotificationIOS } from 'react-native';
import VoipPushNotification from 'react-native-voip-push-notification';

import parseCustomNoti from './pushNotification-parse';

let voipApnsToken = '';

export const getPushNotificationToken = () => {
  return Promise.resolve(voipApnsToken);
};

export const registerPushNotification = () => {
  VoipPushNotification.addEventListener('register', onVoipRegister);
  VoipPushNotification.addEventListener('notification', onVoipNotification);
  VoipPushNotification.requestPermissions();
};

const onVoipRegister = token => {
  voipApnsToken = token;
};

const onVoipNotification = noti => {
  const n = parseCustomNoti(noti);
  if (!n) {
    return;
  }
  //
  const alertBody = n.body || JSON.stringify(n);
  const isCall = /call/i.test(alertBody);
  const alertAction = isCall ? 'Answer' : 'View';
  const soundName = isCall ? 'incallmanager_ringtone.mp3' : undefined;
  //
  PushNotificationIOS.getApplicationIconBadgeNumber(n => {
    n = (n || 0) + 1;
    VoipPushNotification.presentLocalNotification({
      alertBody,
      alertAction,
      soundName,
      applicationIconBadgeNumber: n,
    });
    PushNotificationIOS.setApplicationIconBadgeNumber(n);
  });
};

export const resetBadgeNumber = () => {
  PushNotificationIOS.setApplicationIconBadgeNumber(0);
};
