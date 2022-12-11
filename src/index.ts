import './embed/polyfill'
import './utils/captureConsoleOutput'
import './polyfill'
import './polyfill/mobx'
import './utils/validator'
import './stores/Nav2' // Fix circular dependencies
import './stores/callStore2' // Fix circular dependencies
import './stores/authStore2' // Fix circular dependencies
import './api/syncPnToken2' // Fix circular dependencies
import 'brekekejs/lib/phonebook'
import 'brekekejs/lib/webnotification'

import { AppRegistry } from 'react-native'

import { App } from './components/App'
import { exposeEmbedApi } from './embed/exposeEmbedApi'

AppRegistry.registerComponent('BrekekePhone', () => App)

const runApp = (rootTag: HTMLElement) => {
  AppRegistry.runApplication('BrekekePhone', { rootTag })
}

if (window._BrekekePhoneWebRoot) {
  runApp(window._BrekekePhoneWebRoot)
}
exposeEmbedApi(runApp)
