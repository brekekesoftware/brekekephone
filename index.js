// Main entry for the react-native bundle

import { AppRegistry } from 'react-native';

import App from './src/App';
import './src/nativeModules/globalError';
import { registerPn } from './src/nativeModules/pushNotification';

setTimeout(registerPn);
AppRegistry.registerComponent('App', () => App);
