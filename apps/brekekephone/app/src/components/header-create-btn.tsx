import type { FC } from 'react'

import { mdiPlus } from '#/assets/icons'
import { RnIcon, RnTouchableOpacity } from '#/components/rn'

export const CreateBtn: FC<{
  white: boolean
  onPress(): void
}> = p => {
  const { onPress, white } = p
  return (
    <RnTouchableOpacity
      onPress={onPress}
      className={[
        'absolute top-2.75 right-1.25 h-12.5 w-12.5 rounded-full',
        white ? 'bg-background' : 'bg-primary',
      ]}
    >
      <RnIcon color={white ? 'black' : 'white'} path={mdiPlus} />
    </RnTouchableOpacity>
  )
}
