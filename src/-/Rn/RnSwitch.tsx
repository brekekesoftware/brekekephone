import React from 'react'
import { StyleSheet, View } from 'react-native'

import v from '../variables'

const css = StyleSheet.create({
  RnSwitch: {
    height: 12,
    width: 32,
    backgroundColor: v.fn.darken(0.05, v.hoverBg),
    borderRadius: 12,
  },
  RnSwitch__enabled: {
    backgroundColor: v.colors.primaryFn(0.1),
  },
  Circle: {
    position: 'absolute',
    top: -3,
    left: -1,
    width: 18,
    height: 18,
    borderRadius: 18,
    backgroundColor: v.fn.darken(0.05, v.borderBg),
    ...v.boxShadow,
  },
  Circle__enabled: {
    left: null as any,
    right: -1,
    backgroundColor: v.colors.primary,
  },
})

const RnSwitch = ({ enabled, style, ...p }) => (
  <View {...p} style={[css.RnSwitch, enabled && css.RnSwitch__enabled, style]}>
    <View style={[css.Circle, enabled && css.Circle__enabled]} />
  </View>
)

export default RnSwitch
