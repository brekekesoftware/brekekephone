import type { FC } from 'react'
import type { Animated } from 'react-native'
import { View } from 'react-native'

import { AnimatedText, AnimatedView } from '@/rn/core/components/animated'
import { RnTouchableOpacity } from '#/components/rn'
import { v } from '#/components/variables'
import { intl } from '#/stores/intl'

const css = {
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
}

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
        <AnimatedText
          numberOfLines={1}
          className='font-bold'
          style={textStyle as any}
        >
          {displayName}
        </AnimatedText>
        <AnimatedText
          className='text-[11.2px] font-normal'
          style={subTextStyle as any}
        >
          {intl`Park number: ` + parkNumber}
        </AnimatedText>
      </View>
    </RnTouchableOpacity>
  )

  return (
    <View style={[css.outer, !available && css.disabled]}>
      {useAnimated ? (
        <AnimatedView style={wrapperStyle}>{content}</AnimatedView>
      ) : (
        <View style={wrapperStyle}>{content}</View>
      )}
    </View>
  )
}
