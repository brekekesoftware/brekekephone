import type { FC } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import type { LinearGradientProps } from 'react-native-linear-gradient'
import LinearGradient from 'react-native-linear-gradient'

import { v } from '#/components/variables'

const css = StyleSheet.create({
  BrekekeGradient: {
    height: '100%',
    minHeight: 550,
  },
})

export type BrekekeGradientProps = Omit<LinearGradientProps, 'colors'> & {
  white?: boolean
}
export const BrekekeGradient: FC<BrekekeGradientProps> = props => {
  const colors = props.white
    ? ['white', 'white']
    : [v.colors.primaryFn(0.2), v.revBg]
  if (Platform.OS === 'web') {
    return (
      <LinearGradient
        {...props}
        colors={colors}
        style={[css.BrekekeGradient, props.style]}
      />
    )
  }
  // LinearGradient goes through the Fabric interop layer and crashes Android with "addViewAt: failed to insert view"
  return (
    <View
      {...props}
      style={[
        css.BrekekeGradient,
        { backgroundImage: `linear-gradient(${colors.join(', ')})` },
        props.style,
      ]}
    />
  )
}
