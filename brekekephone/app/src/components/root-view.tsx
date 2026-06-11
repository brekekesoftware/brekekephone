import { SafeAreaView } from '@rntwsc/rn/core/components/safe-area-view'
import { View } from '@rntwsc/rn/core/components/view'
import { isWeb } from '@rntwsc/rn/core/utils/platform'
import type { ReactNode } from 'react'
import { memo } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

type RootViewProps = {
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
