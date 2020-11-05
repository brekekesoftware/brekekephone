import { mdiKeyboardBackspace } from '@mdi/js'
import React, { FC } from 'react'
import { Animated, StyleSheet } from 'react-native'

import { useAnimation } from '../utils/animation'
import { RnIcon, RnTouchableOpacity } from './Rn'

const css = StyleSheet.create({
  BackBtn: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  Inner: {
    width: 50,
    height: 70,
    paddingHorizontal: 0,
    paddingVertical: 20,
    borderRadius: 0,
  },
})

const BackBtn: FC<{
  compact: boolean
  onPress(): void
}> = p => {
  const { compact, onPress } = p
  const cssInnerA = useAnimation(compact, {
    height: [70, 40],
    paddingVertical: [20, 5],
  })
  return (
    <RnTouchableOpacity onPress={onPress} style={css.BackBtn}>
      <Animated.View style={[css.Inner, cssInnerA]}>
        <RnIcon path={mdiKeyboardBackspace} />
      </Animated.View>
    </RnTouchableOpacity>
  )
}

export default BackBtn
