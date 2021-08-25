import React, { FC } from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'
import Svg, { Path } from 'react-native-svg'

import { v } from './variables'

const css = StyleSheet.create({
  Icon: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export const RnIcon: FC<
  ViewProps & {
    color?: string
    path: string
    size?: number
    viewBox?: string
  }
> = ({ color, path, size = v.iconSize, viewBox, style, ...p }) => (
  <View {...p} style={[css.Icon, style]}>
    <Svg
      height={size}
      /* 24 is the regular size of the @mdi/js package */
      viewBox={viewBox || '0 0 24 24'}
      width={size}
    >
      <Path d={path} fill={color || 'black'} />
    </Svg>
  </View>
)
