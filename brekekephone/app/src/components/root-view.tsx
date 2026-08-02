import type { ReactNode } from 'react'
import { memo } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { isWeb } from 'rntwsc/platform'
import { SafeAreaView } from 'rntwsc/tw/components/safe-area-view'
import { View } from 'rntwsc/tw/components/view'

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
