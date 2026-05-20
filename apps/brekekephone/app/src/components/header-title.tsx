import type { FC } from 'react'

import { trimDisplayName } from '#/components/call-bar'
import { RnText } from '#/components/rn'
import { AnimatedText, AnimatedView } from '#/components/rn-animated'

export const Title: FC<{
  compact: boolean
  description?: string
  title: string
}> = p => {
  const { compact, description, title } = p
  return (
    <AnimatedView
      className={[
        'pl-3.75 mr-6.25 transition-all duration-150',
        compact ? 'py-2.5' : 'py-3.75',
      ]}
    >
      <AnimatedText
        numberOfLines={1}
        className={[
          'font-bold text-black transition-all duration-150',
          compact ? 'text-[16.8px] leading-5' : 'text-[25.2px] leading-9',
        ]}
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
