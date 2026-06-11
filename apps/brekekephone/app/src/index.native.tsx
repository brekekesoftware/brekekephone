import '#/utils/capture-console-output'
import '#/polyfill'
import '#/embed/polyfill'
import '#/polyfill/mobx-configure'
import '#/brekekejs/pal'
import '#/brekekejs/webrtcclient'
import '#/brekekejs/phonebook'
import '#/brekekejs/webnotification'
import '#/stores/ctx-imports'

import { AppRegistry } from 'react-native'

import { initTheme } from '@/rn/core/theme/config'
import { isWeb } from '@/rn/core/utils/platform'
import App from '#/components/app'
import { IncomingCallRoot } from '#/components/incoming-call-root'
import { brekekeTheme } from '#/theme'
import { registerValidatorLabels } from '#/utils/validator'

initTheme([brekekeTheme], brekekeTheme)
registerValidatorLabels()
if (!isWeb) {
  AppRegistry.registerComponent('BrekekePhone', () => App)
  AppRegistry.registerComponent('IncomingCall', () => IncomingCallRoot)
}
