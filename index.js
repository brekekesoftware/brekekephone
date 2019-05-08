import { AppRegistry, Platform } from 'react-native';
import { registerVoipApns } from './app/push-notification/apns';
import App from './app/App';

import { Linking } from 'react-native';

setTimeout(() => {
  Linking.getInitialURL()
    .then(url => {
      console.warn('getInitialURL', url);
    });
}, 2000);

AppRegistry.registerComponent('App', () => App);

if (Platform.OS === 'ios') {
  registerVoipApns();
}
