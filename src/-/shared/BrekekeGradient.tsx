import React from 'react'
import LinearGradient from 'react-native-linear-gradient'

import g from '../global'
import { StyleSheet } from '../Rn'

const css = StyleSheet.create({
  BrekekeGradient: {
    height: '100%',
    minHeight: 550,
  },
})

const BrekekeGradient = props => (
  <LinearGradient
    {...props}
    colors={[g.colors.primaryFn(0.2), g.revBg]}
    style={[css.BrekekeGradient, props.style]}
  />
)

export default BrekekeGradient
