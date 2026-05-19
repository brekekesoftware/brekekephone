import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Animated } from 'react-native'

import { AnimatedView } from '@/rn/core/components/animated'
import { View } from '@/rn/core/components/view'
import { RnText } from '#/components/rn'

type ToastProps = {
  title: string
  isVisible?: boolean
  duration?: number
  containerStyles?: {}
}

const TOAST_ANIMATION_DURATION = 3000
const MAX_LENGTH_TEXT = 50

export const Toast: FC<ToastProps> = ({
  title,
  isVisible,
  containerStyles,
}: ToastProps) => {
  const [fadeAnim] = useState(new Animated.Value(0))
  const validTitle =
    title.length > MAX_LENGTH_TEXT
      ? `${title.substring(0, MAX_LENGTH_TEXT)}...`
      : title

  useEffect(() => {
    if (isVisible) {
      fadeAnim.setValue(1)
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: TOAST_ANIMATION_DURATION,
        useNativeDriver: true,
      }).start()
    }
  }, [fadeAnim, isVisible])

  return (
    <View
      className='absolute right-0 left-0 top-2.5 justify-center'
      style={containerStyles}
    >
      <AnimatedView
        className='px-1.25 pt-1 pb-1.25'
        style={{ opacity: fadeAnim }}
      >
        <RnText normal white>
          {validTitle}
        </RnText>
      </AnimatedView>
    </View>
  )
}
