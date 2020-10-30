import React, { FC } from 'react'
import { StyleSheet } from 'react-native'
import LinearGradient, {
  LinearGradientProps,
} from 'react-native-linear-gradient'

import g from '../variables'

const css = StyleSheet.create({
  BrekekeGradient: {
    height: '100%',
    minHeight: 550,
  },
})

const BrekekeGradient: FC<Omit<LinearGradientProps, 'colors'>> = props => (
  <LinearGradient
    {...props}
    colors={[g.colors.primaryFn(0.2), g.revBg]}
    style={[css.BrekekeGradient, props.style]}
  />
)

export default BrekekeGradient
