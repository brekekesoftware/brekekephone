import { PushNotificationIOS } from 'react-native';
import VoipPushNotification from 'react-native-voip-push-notification';

import parse from './PushNotification-parse';

let voipApnsToken = '';
const onToken = t => {
  if (t) {
    voipApnsToken = t;
  }
};
const onNotification = async n => {
  n = await parse(n);
  if (!n) {
    return;
  }
  //
  PushNotificationIOS.getApplicationIconBadgeNumber(badge => {
    badge = (badge || 0) + 1;
    VoipPushNotification.presentLocalNotification({
      alertBody: n.body,
      alertAction: n.isCall ? 'Answer' : 'View',
      soundName: n.isCall ? 'incallmanager_ringtone.mp3' : undefined,
      applicationIconBadgeNumber: badge,
    });
    PushNotificationIOS.setApplicationIconBadgeNumber(badge);
  });
};

const PushNotification = {
  register: () => {
    VoipPushNotification.addEventListener('register', onToken);
    VoipPushNotification.addEventListener('notification', onNotification);
    VoipPushNotification.requestPermissions();
    VoipPushNotification.registerVoipToken();
  },
  getToken: () => {
    return Promise.resolve(voipApnsToken);
  },
  resetBadgeNumber: () => {
    PushNotificationIOS.setApplicationIconBadgeNumber(0);
  },
};

export default PushNotification;
