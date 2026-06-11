import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Animated } from 'react-native'

import { View } from '@/rn/core/components/view'
import type { ClassName } from '@/rn/core/tw/class-name'
import { RnText } from '#/components/rn'
import { AnimatedView } from '#/components/rn-class-name-components'

type ToastProps = {
  title: string
  isVisible?: boolean
  duration?: number
  containerClassName?: ClassName
  containerMarginTop?: number
}

const MAX_LENGTH_TEXT = 50
const TOAST_ANIMATION_DURATION = 3000

export const Toast: FC<ToastProps> = ({
  title,
  isVisible,
  containerClassName,
  containerMarginTop,
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
      className={[
        'absolute top-2.5 right-0 left-0 justify-center',
        containerClassName,
      ]}
      style={
        containerMarginTop !== undefined
          ? { marginTop: containerMarginTop }
          : undefined
      }
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
