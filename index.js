import { AppRegistry } from 'react-native';

import App from './src/App';
import './src/rn/globalError';
import { registerPn } from './src/rn/pn';

setTimeout(registerPn);
AppRegistry.registerComponent('App', () => App);
