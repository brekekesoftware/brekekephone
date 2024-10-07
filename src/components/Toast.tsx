import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Animated, StyleSheet, View } from 'react-native'

import { RnText } from './Rn'

const css = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    left: 0,
    top: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 10,
    backgroundColor: '#000',
    maxWidth: '50%',
    opacity: 0.8,
    borderRadius: 5,
  },
  textStyle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
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
        <RnText style={css.textStyle}>{validTitle}</RnText>
      </Animated.View>
    </View>
  )
}
