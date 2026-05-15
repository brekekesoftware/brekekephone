import type { ReactNode } from 'react'
import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

import { v } from '#/components/variables'
import { isWeb } from '#/config'

interface RootViewProps {
  children: ReactNode
}

const css = StyleSheet.create({
  App: {
    backgroundColor: v.bg,
  },
})

export const RootView = memo(({ children }: RootViewProps) => {
  const s = [StyleSheet.absoluteFill, css.App]

  if (isWeb) {
    return <View style={s}>{children}</View>
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s}>{children}</SafeAreaView>
    </SafeAreaProvider>
  )
})
