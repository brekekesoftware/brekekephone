import { AppRegistry } from 'react-native';
import App from './app/App';
import './web/index.css';

AppRegistry.registerComponent('App', () => App);

AppRegistry.runApplication('App', {
  rootTag: document.getElementById('root'),
});
