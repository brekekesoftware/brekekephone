import type { FC } from 'react'
import { Animated, StyleSheet, View } from 'react-native'

import { RnText, RnTouchableOpacity } from '#/components/Rn'
import { AnimatedText } from '#/components/RnText'
import { v } from '#/components/variables'
import { intl } from '#/stores/intl'

const css = StyleSheet.create({
  outer: {
    borderBottomWidth: 1,
    borderColor: v.borderBg,
  },
  inner: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  disabled: {
    opacity: 0.5,
  },
  selectedBg: {
    backgroundColor: v.colors.primaryFn(0.5),
  },
  solidBg: {
    backgroundColor: v.colors.primary,
  },
  subText: {
    color: v.subColor,
  },
})

interface ParkItemProps {
  index: number
  name: string
  parkNumber: string
  selected: boolean
  available: boolean
  // pickup mode only: slot is occupied → show flash animation
  flashAnim?: Animated.Value
  onPress: () => void
}

export const ParkItem: FC<ParkItemProps> = ({
  index,
  name,
  parkNumber,
  selected,
  available,
  flashAnim,
  onPress,
}) => {
  const showAnimation = !!flashAnim
  const WrapperView: any = showAnimation && !selected ? Animated.View : View

  const flashBg = flashAnim?.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', v.colors.primaryFn(0.1)],
  })
  const flashTextColor = flashAnim?.interpolate({
    inputRange: [0, 1],
    outputRange: ['black', 'white'],
  })

  let wrapperStyle: any
  let nameTextColor: string | Animated.AnimatedInterpolation<string> | undefined

  if (showAnimation) {
    if (selected) {
      wrapperStyle = css.solidBg
      nameTextColor = 'white'
    } else {
      wrapperStyle = { backgroundColor: flashBg }
      nameTextColor = flashTextColor
    }
  } else if (selected) {
    wrapperStyle = css.selectedBg
  }

  const displayName = name || intl`<Unnamed>`

  return (
    <View style={[css.outer, !available && css.disabled]}>
      <WrapperView style={wrapperStyle}>
        <RnTouchableOpacity onPress={available ? onPress : undefined}>
          <View style={css.inner}>
            {nameTextColor && typeof nameTextColor !== 'string' ? (
              <AnimatedText
                bold
                singleLine
                style={{ color: nameTextColor as any }}
              >
                {displayName}
              </AnimatedText>
            ) : (
              <RnText
                bold
                singleLine
                style={nameTextColor ? { color: nameTextColor } : undefined}
              >
                {displayName}
              </RnText>
            )}
            {nameTextColor && typeof nameTextColor !== 'string' ? (
              <AnimatedText
                normal
                small
                style={{ color: nameTextColor as any }}
              >
                {intl`Park number: ` + parkNumber}
              </AnimatedText>
            ) : (
              <RnText
                normal
                small
                style={nameTextColor ? { color: nameTextColor } : css.subText}
              >
                {intl`Park number: ` + parkNumber}
              </RnText>
            )}
          </View>
        </RnTouchableOpacity>
      </WrapperView>
    </View>
  )
}
