import { AppRegistry } from 'react-native';

import App from './App';
import { registerPn } from './rn/pn';
import './index.scss';

setTimeout(registerPn);

const rootTag = document.getElementById('root');
AppRegistry.registerComponent('App', () => App);
AppRegistry.runApplication('App', { rootTag });
