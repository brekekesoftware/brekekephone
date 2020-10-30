import React from 'react'
import { Animated, StyleSheet } from 'react-native'

import { RnText } from '../Rn'
import { AnimatedText } from '../Rn/RnText'
import { useAnimation } from '../utils/animation'
import g from '../variables'

const css = StyleSheet.create({
  Container: {
    padding: 15,
  },
  Title: {
    fontSize: g.fontSizeTitle,
    lineHeight: g.lineHeightTitle,
    fontWeight: 'bold',
    color: 'black',
  } as any,
  Description: {
    color: g.subColor,
  },
})

const Title = p => {
  const { compact, description, title } = p
  const cssContainerA = useAnimation(compact, {
    paddingVertical: [15, 10],
  })
  const cssTitleA = useAnimation(compact, {
    fontSize: [g.fontSizeTitle, g.fontSizeSubTitle],
    lineHeight: [g.lineHeightTitle, 20],
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

export default Title
