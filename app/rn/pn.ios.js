import get from 'lodash/get';
import VoipPushNotification from 'react-native-voip-push-notification';

import * as routerUtils from '../mobx/routerStore';
import {
  getProfileManager,
  getProfileManagerInterval,
} from '../modules/profiles-manage/getset';

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

const onVoipNotification = async notification => {
  //
  const alertBody =
    get(notification, '_data.custom_notification.body') ||
    // Add fallback to see the detail notification if there's no body
    JSON.stringify(notification);
  VoipPushNotification.presentLocalNotification({
    alertBody,
    alertAction: /call/.test(alertBody) ? 'Answer' : 'View',
    soundName: 'incallmanager_ringtone.mp3',
  });
  //
  let mgr = getProfileManager();
  if (!mgr) {
    routerUtils.goToProfilesManage();
    mgr = await getProfileManagerInterval();
  }
  if (mgr) {
    mgr._signinByNotif(notification._data.custom_notification);
  }
};

export { getPnToken, registerPn };
