import { AppRegistry, Platform } from 'react-native';
import { registerVoipApns } from './app/push-notification/apns';
import CodePushApp from './app/CodePushApp';

AppRegistry.registerComponent('App', () => CodePushApp);

if (Platform.OS === 'ios') {
  registerVoipApns();
}
