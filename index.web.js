import '@babel/polyfill';
import { AppRegistry } from 'react-native';
import App from './app/App';
import './web/index.css';

AppRegistry.registerComponent('App', () => App);

const rootTag = document.getElementById('root');
AppRegistry.runApplication('App', { rootTag });
