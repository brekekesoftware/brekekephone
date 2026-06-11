import '#/init-global'

import { AppRegistry } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { composeProviders } from '@/rn/core/utils/compose-providers'
import { App } from '#/app'
import { IncomingCallRoot } from '#/components/incoming-call-root'

const AppNative = composeProviders(SafeAreaProvider, App)
AppRegistry.registerComponent('BrekekePhone', () => AppNative)
AppRegistry.registerComponent('IncomingCall', () => IncomingCallRoot)
