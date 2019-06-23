import { AppRegistry } from 'react-native';

import App from './app/App';
import './app/rn/globalError';
import { registerPn } from './app/rn/pn';

setTimeout(registerPn);
AppRegistry.registerComponent('App', () => App);
