import React, { FC } from 'react'
import { StyleSheet } from 'react-native'
import LinearGradient, {
  LinearGradientProps,
} from 'react-native-linear-gradient'

import { v } from './variables'

const css = StyleSheet.create({
  BrekekeGradient: {
    height: '100%',
    minHeight: 550,
  },
})

export const BrekekeGradient: FC<Omit<LinearGradientProps, 'colors'>> =
  props => (
    <LinearGradient
      {...props}
      colors={[v.colors.primaryFn(0.2), v.revBg]}
      style={[css.BrekekeGradient, props.style]}
    />
  )
