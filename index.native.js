import {AppRegistry} from 'react-native'
//import codePush from 'react-native-code-push'
import {registerVoipApns} from './app/push-notification/apns'
import App from './app/index'

registerVoipApns()
//AppRegistry.registerComponent('App', () => codePush(App))
AppRegistry.registerComponent('App', () => App )
