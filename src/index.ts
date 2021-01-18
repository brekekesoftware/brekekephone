import './utils/captureConsoleOutput'
import './polyfill'
import './utils/validator'
import './stores/Nav2' // Fix circular dependencies
import './stores/authStore2' // Fix circular dependencies
import './api/syncPnToken2' // Fix circular dependencies

import { AppRegistry, Platform } from 'react-native'

import App from './components/App'

AppRegistry.registerComponent('BrekekePhone', () => App)

if (Platform.OS === 'web') {
  AppRegistry.runApplication('BrekekePhone', {
    rootTag: document.getElementById('root'),
  })
}
