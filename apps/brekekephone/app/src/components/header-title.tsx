import type { FC } from 'react'

import { trimDisplayName } from '#/components/call-bar'
import { RnText } from '#/components/rn'
import { AnimatedText, AnimatedView } from '#/components/rn-animated'
import { v } from '#/components/variables'
import { useAnimation } from '#/utils/animation'

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
    <AnimatedView className='pl-3.75 mr-6.25' style={cssContainerA}>
      <AnimatedText
        numberOfLines={1}
        className='font-bold text-black'
        style={cssTitleA}
      >
        {trimDisplayName(title)}
      </AnimatedText>
      {!compact && (
        <RnText className='line-clamp-1 pr-3.75 text-foreground-muted'>
          {description || '\u200a'}
        </RnText>
      )}
    </AnimatedView>
  )
}
