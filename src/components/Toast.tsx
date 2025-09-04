import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Animated, StyleSheet, View } from 'react-native'

import { RnText } from '#/components/Rn'

const css = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    left: 0,
    top: 10,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 5,
    paddingTop: 4,
    paddingBottom: 5,
  },
})

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
    <View style={[css.container, containerStyles]}>
      <Animated.View style={[css.content, { opacity: fadeAnim }]}>
        <RnText normal white>
          {validTitle}
        </RnText>
      </Animated.View>
    </View>
  )
}
