import { View } from '@rntwsc/rn/core/components/view'
import type { ClassName } from '@rntwsc/rn/core/tw/class-name'
import { tw } from '@rntwsc/rn/core/tw/tw'
import type { FC } from 'react'
import type { Animated } from 'react-native'

import { RnTouchableOpacity } from '#/components/rn'
import {
  AnimatedText,
  AnimatedView,
} from '#/components/rn-class-name-components'
import { intl } from '#/stores/intl'
import { useRuntimeStyle } from '#/utils/rn-core-hooks'

type ParkItemProps = {
  index: number
  name: string
  parkNumber: string
  selected: boolean
  available: boolean
  // pickup mode only: slot is occupied -> flash bg+text via Animated.Value
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

  const color1 = useRuntimeStyle('text-background')?.color as string
  const color2 = useRuntimeStyle('text-primary')?.color as string
  const flashBg = flashAnim?.interpolate({
    inputRange: [0, 1],
    outputRange: [color1, color2],
  })

  const color3 = useRuntimeStyle('text-foreground')?.color as string
  const color4 = useRuntimeStyle('text-foreground-inverse')?.color as string
  const flashTextColor = flashAnim?.interpolate({
    inputRange: [0, 1],
    outputRange: [color3, color4],
  })

  let wrapperClass: ClassName
  let textClass: ClassName
  let subTextClass: ClassName
  if (useAnimated) {
    // no className for bg/text - animated style drives the colors
  } else if (selected && flashAnim) {
    wrapperClass = tw`bg-primary`
    textClass = tw`text-foreground`
    subTextClass = tw`text-foreground-muted`
  } else if (selected) {
    wrapperClass = tw`bg-primary-100`
  } else {
    subTextClass = tw`text-foreground-muted`
    textClass = tw`text-foreground`
  }

  const displayName = name || intl`<Unnamed>`

  const content = (
    <RnTouchableOpacity onPress={available ? onPress : undefined}>
      <View className='px-2.5 py-2.5'>
        <AnimatedText
          numberOfLines={1}
          className={['font-bold', textClass]}
          style={
            useAnimated
              ? ({
                  color: flashTextColor,
                } as any)
              : undefined
          }
        >
          {displayName}
        </AnimatedText>
        <AnimatedText
          className={['text-[11.2px] font-normal', subTextClass]}
          style={
            useAnimated
              ? ({
                  color: flashTextColor,
                } as any)
              : undefined
          }
        >
          {intl`Park number: ` + parkNumber}
        </AnimatedText>
      </View>
    </RnTouchableOpacity>
  )

  return (
    <View className={['border-border border-b', !available && 'opacity-50']}>
      {useAnimated ? (
        <AnimatedView
          style={
            {
              backgroundColor: flashBg,
            } as any
          }
        >
          {content}
        </AnimatedView>
      ) : (
        <View className={wrapperClass}>{content}</View>
      )}
    </View>
  )
}
