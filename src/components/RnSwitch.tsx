import { darken, transparentize } from 'polished'
import type { FC } from 'react'
import type { ViewProps } from 'react-native'
import { StyleSheet, View } from 'react-native'

import { v } from '#/components/variables'

const css = StyleSheet.create({
  RnSwitch: {
    height: 12,
    width: 32,
    backgroundColor: darken(0.05, v.hoverBg),
    borderRadius: 12,
  },
  RnSwitch__enabled: {
    backgroundColor: v.colors.primaryFn(0.1),
  },
  // disabled only mutes the "on" colours - the off state is already grey, and both
  // parts stay green so an on row is still readable. a translucent colour rather
  // than an opacity prop: the knob overhangs the track, so fading the group lets
  // the track show through the knob and kills the boxShadow
  RnSwitch__disabled: {
    backgroundColor: transparentize(0.6, v.colors.primaryFn(0.1)),
  },
  Circle: {
    position: 'absolute',
    top: -3,
    left: -1,
    width: 18,
    height: 18,
    borderRadius: 18,
    backgroundColor: darken(0.05, v.borderBg),
    ...v.boxShadow,
  },
  Circle__enabled: {
    transform: [{ translateX: 20 }],
    backgroundColor: v.colors.primary,
  },
  Circle__disabled: {
    backgroundColor: v.colors.primaryFn(0.25),
  },
})

export const RnSwitch: FC<
  ViewProps & {
    enabled: boolean
    disabled?: boolean
  }
> = ({ enabled, disabled, style, ...p }) => (
  <View
    {...p}
    style={[
      css.RnSwitch,
      enabled && css.RnSwitch__enabled,
      enabled && disabled && css.RnSwitch__disabled,
      style,
    ]}
  >
    <View
      style={[
        css.Circle,
        enabled && css.Circle__enabled,
        enabled && disabled && css.Circle__disabled,
      ]}
    />
  </View>
)
