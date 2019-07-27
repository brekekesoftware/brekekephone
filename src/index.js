import { AppRegistry } from 'react-native';

import './-nativeBaseWebPolyfill';
import App from './AppWeb';
import './index.scss';
import { registerPn } from './nativeModules/pushNotification';

setTimeout(registerPn);
const rootTag = document.getElementById('root');
AppRegistry.registerComponent('App', () => App);

AppRegistry.runApplication('App', {
  rootTag,
});
