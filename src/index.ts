import App from './-/App'
import { AppRegistry, Platform } from './-/Rn'

AppRegistry.registerComponent('App', () => App)

if (Platform.OS === 'web') {
  AppRegistry.runApplication('App', {
    rootTag: document.getElementById('root'),
  })
}
