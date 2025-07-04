import type { FC } from 'react'
import { useState } from 'react'
import type { TouchableOpacityProps, ViewProps } from 'react-native'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'

import { RnText, RnTouchableOpacity } from '#/components/Rn'
import { v } from '#/components/variables'
import { isIos } from '#/config'
import { BackgroundTimer } from '#/utils/BackgroundTimer'

const css = StyleSheet.create({
  ButtonIcon: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  ButtonIcon_Btn: {
    borderWidth: 1,
    padding: 12,
  },
  ButtonIcon_Name: {
    paddingTop: 5,
    minWidth: isIos ? 70 : 80,
    textAlign: 'center',
  },
})

export const ButtonIcon: FC<{
  color: string
  path: string
  size?: number
  disabled?: boolean
  onPress?(): void
  style?: TouchableOpacityProps['style']
  bgcolor?: string
  noborder?: boolean
  bdcolor?: string
  name?: string
  textcolor?: string
  styleContainer?: ViewProps['style']
  msLoading?: number
  loading?: boolean
}> = p => {
  const [isLoading, setLoading] = useState(false)
  const onBtnPress = () => {
    if (p.msLoading) {
      setLoading(true)
      BackgroundTimer.setTimeout(() => {
        // TODO: possible react warning memory leak set state after unmount
        setLoading(false)
      }, p.msLoading)
    }
    p.onPress?.()
  }
  const size = p.size || 15
  return (
    <View style={[css.ButtonIcon, p.styleContainer]}>
      <RnTouchableOpacity
        disabled={isLoading || p.loading || p.disabled}
        onPress={onBtnPress}
        style={[
          css.ButtonIcon_Btn,
          p.style,
          { borderRadius: size * 1.5 },
          { backgroundColor: p?.disabled ? v.subColor : p.bgcolor },
          p.noborder && { borderWidth: 0 },
          { borderColor: p.bdcolor },
        ]}
      >
        {isLoading || p.loading ? (
          <ActivityIndicator style={{ width: size, height: size }} />
        ) : (
          <Svg height={size} viewBox='0 0 24 24' width={size}>
            <Path d={p.path} fill={p.color || 'black'} />
          </Svg>
        )}
      </RnTouchableOpacity>
      {p.name && (
        <RnText
          small
          style={[css.ButtonIcon_Name, !!p.textcolor && { color: p.textcolor }]}
        >
          {p.name}
        </RnText>
      )}
    </View>
  )
}
