import { SafeAreaProvider } from 'react-native-safe-area-context'

import { composeProviders } from '@/rn/core/utils/compose-providers'
import { AppShared } from '#/components/app-shared'

export const App = composeProviders(SafeAreaProvider, AppShared)
