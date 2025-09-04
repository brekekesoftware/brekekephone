import '#/utils/captureConsoleOutput'
import '#/embed/polyfill'
import '#/polyfill'
import '#/polyfill/mobx-configure'
import '#/brekekejs/pal'
import '#/brekekejs/webrtcclient'
import '#/brekekejs/phonebook'
import '#/brekekejs/webnotification'
import '#/stores/ctx-imports'

import { AppRegistry } from 'react-native'

import App from '#/components/App'
import { exposeEmbedApi } from '#/embed/exposeEmbedApi'
import { registerValidatorLabels } from '#/utils/validator'

registerValidatorLabels()
AppRegistry.registerComponent('BrekekePhone', () => App)

const runApp = (rootTag: HTMLElement) => {
  AppRegistry.runApplication('BrekekePhone', { rootTag })
}

if (window._BrekekePhoneWebRoot) {
  runApp(window._BrekekePhoneWebRoot)
}
exposeEmbedApi(runApp)
