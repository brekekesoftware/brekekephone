import type { ReactNode } from 'react'
import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context'

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
      <InsetView>{children}</InsetView>
    </SafeAreaProvider>
  )
})

// a SafeAreaView root commits insets from the UI thread; on Android that raced JS mounts (addViewAt crash)
const InsetView = ({ children }: RootViewProps) => {
  const i = useSafeAreaInsets()
  const padding = {
    paddingTop: i.top,
    paddingBottom: i.bottom,
    paddingLeft: i.left,
    paddingRight: i.right,
  }
  return (
    <View style={[StyleSheet.absoluteFill, css.App, padding]}>{children}</View>
  )
}
