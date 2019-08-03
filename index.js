// Main entry for the react-native bundle

import './src/nativeModules/globalError';

import { AppRegistry } from 'react-native';

import App from './src/App';
import { registerPn } from './src/nativeModules/pushNotification';

setTimeout(registerPn);
AppRegistry.registerComponent('App', () => App);
