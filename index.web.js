import {AppRegistry} from 'react-native'
import './web/index.css'

import App from './app/'

AppRegistry.registerComponent('App', () => App)
AppRegistry.runApplication('App', {
  rootTag: document.getElementById('react')
})
