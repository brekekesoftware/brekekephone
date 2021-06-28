import './utils/captureConsoleOutput'
import './polyfill'
import './utils/validator'
import './stores/Nav2' // Fix circular dependencies
import './stores/authStore2' // Fix circular dependencies
import './api/syncPnToken2' // Fix circular dependencies

import { configure, onReactionError } from 'mobx'
import { AppRegistry, Platform } from 'react-native'

import App from './components/App'
import callStore from './stores/callStore'
import { setCallStore } from './stores/cancelRecentPn'

configure({
  enforceActions: 'never',
  computedRequiresReaction: false,
  observableRequiresReaction: false,
  reactionRequiresObservable: false,
  disableErrorBoundaries: false,
})
onReactionError((err: Error) => {
  console.error(err)
})

setCallStore(callStore)
AppRegistry.registerComponent('BrekekePhone', () => App)

if (Platform.OS === 'web') {
  AppRegistry.runApplication('BrekekePhone', {
    rootTag: document.getElementById('root'),
  })
}
