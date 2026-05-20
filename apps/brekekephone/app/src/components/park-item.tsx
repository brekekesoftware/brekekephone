import type { FC } from 'react'

import { View } from '@/rn/core/components/view'
import type { ClassName } from '@/rn/core/tw/class-name'
import { RnTouchableOpacity } from '#/components/rn'
import { AnimatedText, AnimatedView } from '#/components/rn-animated'
import { intl } from '#/stores/intl'

interface ParkItemProps {
  index: number
  name: string
  parkNumber: string
  selected: boolean
  available: boolean
  // pickup mode only: occupied slot flashes (bg + text) to grab attention
  flash?: boolean
  // shared on/off toggle that drives the flash transition
  flashOn?: boolean
  onPress: () => void
}

export const ParkItem: FC<ParkItemProps> = ({
  name,
  parkNumber,
  selected,
  available,
  flash,
  flashOn,
  onPress,
}) => {
  const animating = !!flash && !selected

  let wrapperClass: ClassName
  let textClass: ClassName
  let subTextClass: ClassName
  if (animating) {
    // longer rise (1500ms), shorter fall (1000ms) — matches the old timing
    const duration = flashOn ? 'duration-1500' : 'duration-1000'
    wrapperClass = ['transition-all', duration, flashOn ? 'bg-primary' : 'bg-white']
    textClass = ['transition-all', duration, flashOn ? 'text-white' : 'text-black']
    subTextClass = textClass
  } else if (selected && flash) {
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
        <AnimatedText numberOfLines={1} className={['font-bold', textClass]}>
          {displayName}
        </AnimatedText>
        <AnimatedText className={['text-[11.2px] font-normal', subTextClass]}>
          {intl`Park number: ` + parkNumber}
        </AnimatedText>
      </View>
    </RnTouchableOpacity>
  )

  return (
    <View className={['border-b border-border', !available && 'opacity-50']}>
      {animating ? (
        <AnimatedView className={wrapperClass}>{content}</AnimatedView>
      ) : (
        <View className={wrapperClass}>{content}</View>
      )}
    </View>
  )
}
