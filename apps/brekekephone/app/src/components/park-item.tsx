import type { FC } from 'react'
import type { Animated } from 'react-native'

import { View } from '@/rn/core/components/view'
import type { ClassName } from '@/rn/core/tw/class-name'
import { RnTouchableOpacity } from '#/components/rn'
import { AnimatedText, AnimatedView } from '#/components/rn-animated'
import { v } from '#/components/variables'
import { intl } from '#/stores/intl'

interface ParkItemProps {
  index: number
  name: string
  parkNumber: string
  selected: boolean
  available: boolean
  // pickup mode only: slot is occupied → flash bg+text via Animated.Value
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

  let wrapperClass: ClassName
  let textClass: ClassName
  let subTextClass: ClassName
  if (useAnimated) {
    // no className for bg/text — animated style drives the colors
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
          style={useAnimated ? ({ color: flashTextColor } as any) : undefined}
        >
          {displayName}
        </AnimatedText>
        <AnimatedText
          className={['text-[11.2px] font-normal', subTextClass]}
          style={useAnimated ? ({ color: flashTextColor } as any) : undefined}
        >
          {intl`Park number: ` + parkNumber}
        </AnimatedText>
      </View>
    </RnTouchableOpacity>
  )

  return (
    <View className={['border-border border-b', !available && 'opacity-50']}>
      {useAnimated ? (
        <AnimatedView style={{ backgroundColor: flashBg } as any}>
          {content}
        </AnimatedView>
      ) : (
        <View className={wrapperClass}>{content}</View>
      )}
    </View>
  )
}
