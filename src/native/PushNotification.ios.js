import { PushNotificationIOS } from 'react-native';
import VoipPushNotification from 'react-native-voip-push-notification';

import parse from './PushNotification-parse';

let voipApnsToken = ``;
const onToken = t => {
  if (t) {
    voipApnsToken = t;
  }
};
const onNotification = n => {
  n = n && parse(n);
  //
  const alertBody = n.body || JSON.stringify(n);
  const isCall = /call/i.test(alertBody);
  const alertAction = isCall ? `Answer` : `View`;
  const soundName = isCall ? `incallmanager_ringtone.mp3` : undefined;
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

const PushNotification = {
  register: () => {
    VoipPushNotification.addEventListener(`register`, onToken);
    VoipPushNotification.addEventListener(`notification`, onNotification);
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
