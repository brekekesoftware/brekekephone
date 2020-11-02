import { AppRegistry, Platform } from 'react-native'

import App from './App'

AppRegistry.registerComponent('BrekekePhone', () => App)

if (Platform.OS === 'web') {
  AppRegistry.runApplication('BrekekePhone', {
    rootTag: document.getElementById('root'),
  })
}
