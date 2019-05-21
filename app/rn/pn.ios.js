import get from 'lodash/get';
import { PushNotificationIOS } from 'react-native';
import VoipPushNotification from 'react-native-voip-push-notification';

import openCustomNoti from './pn-openCustomNoti';
import parseCustomNoti from './pn-parseCustomNoti';

let voipApnsToken = '';
export const getPnToken = () => {
  return Promise.resolve(voipApnsToken);
};

export const registerPn = () => {
  VoipPushNotification.addEventListener('register', onVoipRegister);
  VoipPushNotification.addEventListener('notification', onVoipNotification);
  VoipPushNotification.requestPermissions();
};

const onVoipRegister = token => {
  voipApnsToken = token;
};

const onVoipNotification = noti => {
  //
  const customNoti = parseCustomNoti(noti);
  openCustomNoti(customNoti);
  //
  const alertBody =
    get(customNoti, 'body') ||
    // Add fallback to see the detail notification if there's no body
    JSON.stringify(noti);
  const isCall = /call/.test(alertBody);
  const alertAction = isCall ? 'Answer' : 'View';
  const soundName = isCall ? 'incallmanager_ringtone.mp3' : undefined;
  const category = isCall ? 'incoming_call' : 'incoming_message';
  //
  VoipPushNotification.presentLocalNotification({
    alertBody,
    alertAction,
    soundName,
    category,
  });
  PushNotificationIOS.setApplicationIconBadgeNumber(1);
};
