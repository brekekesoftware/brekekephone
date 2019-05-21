import { AppRegistry } from 'react-native';

import App from './app/App';
import * as pn from './app/rn/pn';

setTimeout(pn.registerPn);
AppRegistry.registerComponent('App', () => App);
