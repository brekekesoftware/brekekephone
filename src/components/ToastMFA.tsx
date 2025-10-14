import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Animated, Dimensions, StyleSheet, View } from 'react-native'

import { mdiClose } from '#/assets/icons'
import { RnIcon, RnText, RnTouchableOpacity } from '#/components/Rn'
import { v } from '#/components/variables'

const { width } = Dimensions.get('window')
const css = StyleSheet.create({
  Container: {
    justifyContent: 'center',
    width: '90%',
  },
  Content: {
    width: '80%',
  },
  Body: {
    flexDirection: 'row',
    width: width * 0.88,
    justifyContent: 'space-around',
    borderRadius: 5,
    paddingVertical: 10,
    maxWidth: 400,
  },
  ToastErr: { backgroundColor: v.colors.danger },
  ToastInfo: { backgroundColor: v.colors.info },
})

type ToastProps = {
  body: string
  isVisible?: boolean
  type: 'err' | 'info'
  duration?: number
  containerStyles?: {}
  onClose?: () => void
}

const TOAST_ANIMATION_DURATION = 800

export const ToastMFA: FC<ToastProps> = ({
  body,
  isVisible,
  containerStyles,
  type,
  onClose,
}: ToastProps) => {
  const [fadeAnim] = useState(new Animated.Value(0))

  useEffect(() => {
    fadeAnim.setValue(0)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: TOAST_ANIMATION_DURATION,
      useNativeDriver: true,
    }).start()
  }, [fadeAnim, isVisible])
  const bg = {
    err: css.ToastErr,
    info: css.ToastInfo,
  }
  return (
    <View style={[css.Container, containerStyles]}>
      <Animated.View style={[css.Body, bg[type], { opacity: fadeAnim }]}>
        <View style={css.Content}>
          <RnText normal white>
            {body}
          </RnText>
        </View>

        <RnTouchableOpacity onPress={onClose}>
          <RnIcon color='white' path={mdiClose} />
        </RnTouchableOpacity>
      </Animated.View>
    </View>
  )
}
