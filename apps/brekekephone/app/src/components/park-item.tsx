import type { FC } from 'react'
import type { Animated } from 'react-native'

import { View } from '@/rn/core/components/view'
import { v } from '#/components/variables'
import { RnTouchableOpacity } from '#/components/rn'
import { AnimatedText, AnimatedView } from '#/components/rn-animated'
import { intl } from '#/stores/intl'

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
  let wrapperClass: string | undefined
  let textStyle: { color: Animated.AnimatedInterpolation<string> } | undefined
  let textClass: string | undefined
  let subTextStyle: typeof textStyle | undefined
  let subTextClass: string | undefined

  if (useAnimated) {
    wrapperStyle = { backgroundColor: flashBg }
    textStyle = { color: flashTextColor! }
    subTextStyle = textStyle
  } else if (selected && flashAnim) {
    wrapperClass = 'bg-primary'
    textClass = 'text-white'
    subTextClass = 'text-white'
  } else if (selected) {
    wrapperClass = 'bg-primary-100'
  } else {
    subTextClass = 'text-foreground-muted'
  }

  const displayName = name || intl`<Unnamed>`

  const content = (
    <RnTouchableOpacity onPress={available ? onPress : undefined}>
      <View className='px-2.5 py-2.5'>
        <AnimatedText
          numberOfLines={1}
          className={['font-bold', textClass]}
          style={textStyle as any}
        >
          {displayName}
        </AnimatedText>
        <AnimatedText
          className={['text-[11.2px] font-normal', subTextClass]}
          style={subTextStyle as any}
        >
          {intl`Park number: ` + parkNumber}
        </AnimatedText>
      </View>
    </RnTouchableOpacity>
  )

  return (
    <View
      className={[
        'border-b border-border',
        !available && 'opacity-50',
      ]}
    >
      {useAnimated ? (
        <AnimatedView style={wrapperStyle}>{content}</AnimatedView>
      ) : (
        <View className={wrapperClass}>{content}</View>
      )}
    </View>
  )
}
