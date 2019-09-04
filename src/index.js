// Main entry for the create-react-app bundle

import './index.scss';
import './shared/polyfillForNativeBaseWeb';

import { AppRegistry } from 'react-native';

import App from './AppWeb';
import { registerPushNotification } from './shared/pushNotification';

setTimeout(registerPushNotification);
AppRegistry.registerComponent('App', () => App);
AppRegistry.runApplication('App', {
  rootTag: document.getElementById('root'),
});
