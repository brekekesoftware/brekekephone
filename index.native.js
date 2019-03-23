import { AppRegistry, Platform } from 'react-native';
import { registerVoipApns } from './app/push-notification/apns';
import App from './app/App';

AppRegistry.registerComponent('App', () => App);

if (Platform.OS === 'ios') {
  registerVoipApns();
}
