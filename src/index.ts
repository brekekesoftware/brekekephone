import './embed/polyfill'
import './utils/captureConsoleOutput'
import './polyfill'
import './polyfill/mobx'
import './utils/validator'
import './stores/Nav2' // fix circular dependencies
import './stores/callStore2' // fix circular dependencies
import './stores/authStore2' // fix circular dependencies
import './api/syncPnToken2' // fix circular dependencies
import './brekekejs/pal'
import './brekekejs/webrtcclient'
import './brekekejs/phonebook'
import './brekekejs/webnotification'

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
