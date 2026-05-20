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

import { View } from '@/rn/core/components/view'
import { initTheme } from '@/rn/core/theme/config'
import { isWeb } from '@/rn/core/utils/platform'
import App from '#/components/app'
import { brekekeTheme } from '#/theme'
import { registerValidatorLabels } from '#/utils/validator'

initTheme([brekekeTheme], brekekeTheme)
registerValidatorLabels()
if (!isWeb) {
  AppRegistry.registerComponent('BrekekePhone', () => App)
  const X = () => <View className='absolute inset-0 bg-red-500' />
  AppRegistry.registerComponent('IncomingCall', () => X)
}
