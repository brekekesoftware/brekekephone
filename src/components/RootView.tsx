import type { ReactNode } from 'react'
import { memo, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

import { v } from '#/components/variables'
import { isWeb } from '#/config'
import { getWebRootIdProps } from '#/embed/polyfill'

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

  const webRootProps = getWebRootIdProps()
  if (isWeb) {
    return (
      <View style={s} {...webRootProps}>
        {children}
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s} {...webRootProps}>
        {children}
      </SafeAreaView>
    </SafeAreaProvider>
  )
})
