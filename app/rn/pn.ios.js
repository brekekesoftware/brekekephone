import get from 'lodash/get';
import VoipPushNotification from 'react-native-voip-push-notification';

import openCustomNoti from './pn-openCustomNoti';
import parseCustomNoti from './pn-parseCustomNoti';

let voipApnsToken = '';
const getPnToken = () => {
  return Promise.resolve(voipApnsToken);
};

const registerPn = () => {
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
  //
  const alertBody =
    get(customNoti, 'body') ||
    // Add fallback to see the detail notification if there's no body
    JSON.stringify(noti);
  const alertAction = /call/.test(alertBody) ? 'Answer' : 'View';
  VoipPushNotification.presentLocalNotification({
    alertBody,
    alertAction,
    soundName: 'incallmanager_ringtone.mp3',
  });
  //
  openCustomNoti(customNoti);
};

export { getPnToken, registerPn };
