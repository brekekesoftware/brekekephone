import './index.scss';
import './shared/polyfillForNativeBaseWeb';

import { AppRegistry } from 'react-native';

import App from './AppWeb';
import { registerPushNotification } from './shared/pushNotification';

AppRegistry.registerComponent('App', () => App);
AppRegistry.runApplication('App', {
  rootTag: document.getElementById('root'),
});
registerPushNotification();
