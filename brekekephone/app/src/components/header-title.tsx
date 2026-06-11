import type { FC } from 'react'

import { trimDisplayName } from '#/components/call-bar'
import { RnText } from '#/components/rn'
import {
  AnimatedText,
  AnimatedView,
} from '#/components/rn-class-name-components'
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
    fontSize: [1.8 * 14, 1.2 * 14],
    lineHeight: [1.8 * 20, 20],
  })
  return (
    <AnimatedView className='mr-6.25 pl-3.75' style={cssContainerA}>
      <AnimatedText
        numberOfLines={1}
        className='text-foreground font-bold'
        style={cssTitleA}
      >
        {trimDisplayName(title)}
      </AnimatedText>
      {!compact && (
        <RnText className='text-foreground-muted line-clamp-1 pr-3.75'>
          {description || '\u200a'}
        </RnText>
      )}
    </AnimatedView>
  )
}
