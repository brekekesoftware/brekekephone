import './embed/polyfill'
import './utils/captureConsoleOutput'
import './polyfill'
import './utils/validator'
import './stores/Nav2' // Fix circular dependencies
import './stores/authStore2' // Fix circular dependencies
import './api/syncPnToken2' // Fix circular dependencies
import 'brekekejs/lib/phonebook'
import 'brekekejs/lib/webnotification'

import { configure, onReactionError } from 'mobx'
import { AppRegistry } from 'react-native'

import { App } from './components/App'
import { exposeEmbedApi } from './embed/exposeEmbedApi'
import { callStore } from './stores/callStore'
import { setCallStore } from './stores/cancelRecentPn'

configure({
  enforceActions: 'never',
  computedRequiresReaction: false,
  observableRequiresReaction: false,
  reactionRequiresObservable: false,
  disableErrorBoundaries: false,
})
onReactionError((err: Error) => {
  console.error('onEractionError', err)
})

setCallStore(callStore)
AppRegistry.registerComponent('BrekekePhone', () => App)

const runApp = (rootTag: HTMLElement) => {
  AppRegistry.runApplication('BrekekePhone', { rootTag })
}

if (window._BrekekePhoneWebRoot) {
  runApp(window._BrekekePhoneWebRoot)
}
exposeEmbedApi(runApp)
