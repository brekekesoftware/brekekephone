// Main entry for the react-native bundle

import { AppRegistry } from 'react-native';

import App from './src/App';
import { registerPushNotification } from './src/shared/pushNotification';

setTimeout(registerPushNotification);
AppRegistry.registerComponent('App', () => App);
