import { Platform } from 'react-native';
import FCM from 'react-native-fcm';
import VoipPushNotification from 'react-native-voip-push-notification';

const isWakeupByPush = () => {
  const pkg = Platform.OS === 'ios' ? VoipPushNotification : FCM;
  const { wakeupByPush } = pkg;
  pkg.wakeupByPush = false;
  return wakeupByPush;
};

export default isWakeupByPush;
