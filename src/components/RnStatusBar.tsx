import type { FC } from 'react'
import { Platform, StatusBar, StyleSheet, View } from 'react-native'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'

import { isWeb } from '../config'
import { RnTouchableOpacity } from './RnTouchableOpacity'
import { v } from './variables'

const css = StyleSheet.create({
  RnStatusBar: {
    backgroundColor: v.hoverBg,
    ...v.backdropZindex,
    ...Platform.select({
      ios: {
        height: getStatusBarHeight(true),
      },
    }),
  },
  RnStatusBar__warning: {
    backgroundColor: v.colors.warning,
    borderColor: v.colors.warning,
  },
  RnStatusBar__danger: {
    backgroundColor: v.colors.danger,
    borderColor: v.colors.danger,
  },
  Border: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderColor: v.borderBg,
    borderBottomWidth: 1,
    ...v.backdropZindex,
  },
})

export type TRnStatusBarProps = {
  danger?: boolean
  warning?: boolean
  onPress?(): void
}
export const RnStatusBar: FC<TRnStatusBarProps> = p =>
  isWeb ? null : (
    <RnTouchableOpacity
      style={[
        css.RnStatusBar,
        p.warning && css.RnStatusBar__warning,
        p.danger && css.RnStatusBar__danger,
      ]}
      onPress={p.onPress}
    >
      <StatusBar
        backgroundColor={
          p.danger ? v.colors.danger : p.warning ? v.colors.warning : v.hoverBg
        }
        barStyle='dark-content'
      />
      <View style={css.Border} />
    </RnTouchableOpacity>
  )
