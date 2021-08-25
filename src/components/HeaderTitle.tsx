import React, { FC } from 'react'
import { Animated, StyleSheet } from 'react-native'

import { useAnimation } from '../utils/animation'
import { RnText } from './Rn'
import { AnimatedText } from './RnText'
import { v } from './variables'

const css = StyleSheet.create({
  Container: {
    padding: 15,
  },
  Title: {
    fontSize: v.fontSizeTitle,
    lineHeight: v.lineHeightTitle,
    fontWeight: 'bold',
    color: 'black',
  },
  Description: {
    color: v.subColor,
  },
})

export const Title: FC<{
  compact: boolean
  description?: string
  title: string
}> = p => {
  const { compact, description, title } = p
  const cssContainerA = useAnimation(compact, {
    paddingVertical: [15, 10],
  })
  const cssTitleA = useAnimation(compact, {
    fontSize: [v.fontSizeTitle, v.fontSizeSubTitle],
    lineHeight: [v.lineHeightTitle, 20],
  })
  return (
    <Animated.View style={[css.Container, cssContainerA]}>
      <AnimatedText style={[css.Title, cssTitleA]}>{title}</AnimatedText>
      {!compact && (
        <RnText style={css.Description}>{description || '\u200a'}</RnText>
      )}
    </Animated.View>
  )
}
