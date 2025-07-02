import type { FC } from 'react'
import { Animated, StyleSheet } from 'react-native'

import { trimDisplayName } from '#/components/CallBar'
import { RnText } from '#/components/Rn'
import { AnimatedText } from '#/components/RnText'
import { v } from '#/components/variables'
import { useAnimation } from '#/utils/animation'

const css = StyleSheet.create({
  Container: {
    paddingVertical: 15,
    paddingLeft: 15,
    marginRight: 25,
  },
  Title: {
    fontSize: v.fontSizeTitle,
    lineHeight: v.lineHeightTitle,
    fontWeight: 'bold',
    color: 'black',
  },
  Description: {
    color: v.subColor,
    paddingRight: 15,
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
      <AnimatedText singleLine style={[css.Title, cssTitleA]}>
        {trimDisplayName(title)}
      </AnimatedText>
      {!compact && (
        <RnText numberOfLines={1} style={css.Description}>
          {description || '\u200a'}
        </RnText>
      )}
    </Animated.View>
  )
}
