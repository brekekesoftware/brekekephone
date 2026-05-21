import type { FC } from 'react'

import { mdiKeyboardBackspace } from '#/assets/icons'
import { RnIcon, RnTouchableOpacity } from '#/components/rn'
import { AnimatedView } from '#/components/rn-animated'
import { useAnimation } from '#/utils/animation'

export const BackBtn: FC<{
  compact: boolean
  onPress(): void
}> = p => {
  const { compact, onPress } = p
  const cssInnerA = useAnimation(compact, {
    height: [70, 40],
    paddingVertical: [20, 5],
  })
  return (
    <RnTouchableOpacity onPress={onPress} className='absolute top-0 left-0'>
      <AnimatedView className='w-12.5 rounded-none px-0' style={cssInnerA}>
        <RnIcon className='text-foreground' path={mdiKeyboardBackspace} />
      </AnimatedView>
    </RnTouchableOpacity>
  )
}
