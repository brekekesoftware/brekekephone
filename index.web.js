import { AppRegistry } from 'react-native';
import App from './app/';
import './web/index.css';

AppRegistry.registerComponent('App', () => App);

AppRegistry.runApplication('App', {
  rootTag: document.getElementById('root'),
});
