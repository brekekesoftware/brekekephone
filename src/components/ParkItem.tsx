import type { FC } from 'react'
import { Animated, StyleSheet, View } from 'react-native'

import { RnTouchableOpacity } from '#/components/Rn'
import type { TRnText } from '#/components/RnText'
import { AnimatedText, RnText } from '#/components/RnText'
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
  const useAnimated = !!flashAnim && !selected
  const TextComp: TRnText = useAnimated ? AnimatedText : RnText

  const flashBg = flashAnim?.interpolate({
    inputRange: [0, 1],
    outputRange: ['white', v.colors.primary],
  })
  const flashTextColor = flashAnim?.interpolate({
    inputRange: [0, 1],
    outputRange: ['black', 'white'],
  })

  let wrapperStyle: Animated.WithAnimatedObject<object> | undefined
  let textStyle:
    | { color: string }
    | { color: Animated.AnimatedInterpolation<string> }
    | undefined
  let subTextStyle: typeof textStyle | typeof css.subText

  if (useAnimated) {
    wrapperStyle = { backgroundColor: flashBg }
    textStyle = { color: flashTextColor! }
    subTextStyle = textStyle
  } else if (selected && flashAnim) {
    wrapperStyle = css.solidBg
    textStyle = { color: 'white' }
    subTextStyle = textStyle
  } else if (selected) {
    wrapperStyle = css.selectedBg
  } else {
    subTextStyle = css.subText
  }

  const displayName = name || intl`<Unnamed>`

  const content = (
    <RnTouchableOpacity onPress={available ? onPress : undefined}>
      <View style={css.inner}>
        <TextComp bold singleLine style={textStyle as any}>
          {displayName}
        </TextComp>
        <TextComp normal small style={subTextStyle as any}>
          {intl`Park number: ` + parkNumber}
        </TextComp>
      </View>
    </RnTouchableOpacity>
  )

  return (
    <View style={[css.outer, !available && css.disabled]}>
      {useAnimated ? (
        <Animated.View style={wrapperStyle}>{content}</Animated.View>
      ) : (
        <View style={wrapperStyle}>{content}</View>
      )}
    </View>
  )
}
