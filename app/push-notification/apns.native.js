import { get as $ } from 'object-path';
import VoipPushNotification from 'react-native-voip-push-notification';
import { getProfileManager } from '../modules/profiles-manage';

let apnsToken = '';
const getApnsToken = () => apnsToken;

const registerVoipApns = () => {
  VoipPushNotification.addEventListener('register', onVoipRegister);
  VoipPushNotification.addEventListener('notification', onVoipNotification);
  VoipPushNotification.requestPermissions();
};

const onVoipRegister = token => {
  apnsToken = token;
};

let intervalId = 0; // To wait until the profile manager constructed
const onVoipNotification = notification => {
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

  /**
   * Local Notification Payload
   *
   * - `alertBody` : The message displayed in the notification alert.
   * - `alertAction` : The "action" displayed beneath an actionable notification. Defaults to "view";
   * - `soundName` : The sound played when the notification is fired (optional).
   * - `category`  : The category of this notification, required for actionable notifications (optional).
   * - `userInfo`  : An optional object containing additional notification data.
   */
  const alertBody =
    $(notification, '_data.custom_notification.body') ||
    // Add fallback to see the detail notification if there's no body
    JSON.stringify(notification);
  const alertAction = /call/.test(alertBody) ? 'Answer' : 'View';
  const soundName = $(notification, '_data.custom_notification.sound');
  VoipPushNotification.presentLocalNotification({
    alertBody,
    alertAction,
    soundName,
  });
};

export { getApnsToken, registerVoipApns };
