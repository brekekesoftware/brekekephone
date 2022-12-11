import { FC } from 'react'
import {
  Platform,
  StyleSheet,
  TouchableOpacityProps,
  View,
  ViewProps,
} from 'react-native'
import Svg, { Path } from 'react-native-svg'

import { RnText, RnTouchableOpacity } from './Rn'
import { v } from './variables'

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
    minWidth: Platform.OS === 'ios' ? 70 : 80,
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
}> = p => {
  const size = p.size || 15
  return (
    <View style={[css.ButtonIcon, p.styleContainer]}>
      <RnTouchableOpacity
        disabled={p.disabled}
        onPress={p.onPress}
        style={[
          css.ButtonIcon_Btn,
          p.style,
          { borderRadius: size * 1.5 },
          { backgroundColor: p?.disabled ? v.subColor : p.bgcolor },
          p.noborder && { borderWidth: 0 },
          { borderColor: p.bdcolor },
        ]}
      >
        <Svg height={size} viewBox='0 0 24 24' width={size}>
          <Path d={p.path} fill={p.color || 'black'} />
        </Svg>
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
