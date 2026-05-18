import type { ReactNode } from 'react'
import { memo } from 'react'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

import { View } from '@/rn/core/components/view'
import { v } from '#/components/variables'
import { isWeb } from '#/config'

interface RootViewProps {
  children: ReactNode
}

export const RootView = memo(({ children }: RootViewProps) => {
  if (isWeb) {
    return <View className='absolute inset-0 bg-white'>{children}</View>
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: v.bg,
        }}
      >
        {children}
      </SafeAreaView>
    </SafeAreaProvider>
  )
})
