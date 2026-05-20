import type { FC } from 'react'

import { mdiKeyboardBackspace } from '#/assets/icons'
import { RnIcon, RnTouchableOpacity } from '#/components/rn'
import { AnimatedView } from '#/components/rn-animated'

export const BackBtn: FC<{
  compact: boolean
  onPress(): void
}> = p => {
  const { compact, onPress } = p
  return (
    <RnTouchableOpacity onPress={onPress} className='absolute top-0 left-0'>
      <AnimatedView
        className={[
          'w-12.5 px-0 rounded-none transition-all duration-150',
          compact ? 'h-10 py-1.25' : 'h-17.5 py-5',
        ]}
      >
        <RnIcon path={mdiKeyboardBackspace} />
      </AnimatedView>
    </RnTouchableOpacity>
  )
}
