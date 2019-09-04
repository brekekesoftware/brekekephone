// Main entry for the react-native bundle

import './src/shared/globalError';

import { AppRegistry } from 'react-native';

import App from './src/App';
import { registerPushNotification } from './src/shared/pushNotification';

setTimeout(registerPushNotification);
AppRegistry.registerComponent('App', () => App);
