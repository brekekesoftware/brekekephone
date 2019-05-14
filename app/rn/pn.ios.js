import get from 'lodash/get';
import VoipPushNotification from 'react-native-voip-push-notification';

import { getProfileManager } from '../modules/profiles-manage';

let voipApnsToken = '';
const getPnToken = () => voipApnsToken;

const registerPn = () => {
  VoipPushNotification.addEventListener('register', onVoipRegister);
  VoipPushNotification.addEventListener('notification', onVoipNotification);
  VoipPushNotification.requestPermissions();
};

const onVoipRegister = token => {
  voipApnsToken = token;
};

let intervalId = 0; // To wait until the profile manager constructed
const onVoipNotification = notification => {
  const alertBody =
    get(notification, '_data.custom_notification.body') ||
    // Add fallback to see the detail notification if there's no body
    JSON.stringify(notification);
  VoipPushNotification.presentLocalNotification({
    alertBody,
    alertAction: /call/.test(alertBody) ? 'Answer' : 'View',
    soundName: 'incallmanager_ringtone.mp3',
  });

  // TODO use mobx
  if (intervalId) {
    clearInterval(intervalId);
  }
  intervalId = setInterval(() => {
    const mgr = getProfileManager();
    if (!mgr) {
      return;
    }
    mgr._signinByNotif(notification._data.custom_notification);
    clearInterval(intervalId);
    intervalId = 0;
  }, 1000);
};

export { getPnToken, registerPn };
