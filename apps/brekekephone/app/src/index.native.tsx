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

import { isWeb } from '@/rn/core/utils/platform'
import App from '#/components/app'
import { registerValidatorLabels } from '#/utils/validator'

registerValidatorLabels()
if (!isWeb) {
  AppRegistry.registerComponent('BrekekePhone', () => App)
}
