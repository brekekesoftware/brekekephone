import type { ReactNode } from 'react'
import { memo } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { SafeAreaView } from '@/rn/core/components/safe-area-view'
import { View } from '@/rn/core/components/view'
import { isWeb } from '@/rn/core/utils/platform'

interface RootViewProps {
  children: ReactNode
}

export const RootView = memo(({ children }: RootViewProps) => {
  if (isWeb) {
    return <View className='bg-background absolute inset-0'>{children}</View>
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView className='bg-background absolute inset-0'>
        {children}
      </SafeAreaView>
    </SafeAreaProvider>
  )
})
