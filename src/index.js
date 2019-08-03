import './-nativeBaseWebPolyfill';
import './index.scss';

import { AppRegistry } from 'react-native';

import App from './AppWeb';
import { registerPn } from './nativeModules/pushNotification';

setTimeout(registerPn);
const rootTag = document.getElementById('root');
AppRegistry.registerComponent('App', () => App);

AppRegistry.runApplication('App', {
  rootTag,
});
