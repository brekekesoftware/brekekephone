import { observer } from 'mobx-react'
import type { FC } from 'react'
import { Keyboard } from 'react-native'

import { isWeb } from '@/rn/core/utils/platform'
import { mdiKeyboardOffOutline, mdiKeyboardOutline } from '#/assets/icons'
import { AnimatedSize } from '#/components/animated-size'
import { RnIcon, RnText, RnTouchableOpacity } from '#/components/rn'
import { RnKeyboard } from '#/stores/rn-keyboard'

export const ToggleKeyboard: FC<{
  onShowKeyboard(): void
}> = observer(({ onShowKeyboard }) => {
  if (isWeb || (!RnKeyboard.isKeyboardShowing && !onShowKeyboard)) {
    return null
  }
  return (
    <AnimatedSize animateWidth>
      <RnTouchableOpacity
        onPress={
          RnKeyboard.isKeyboardShowing ? Keyboard.dismiss : onShowKeyboard
        }
        className='bg-muted mr-2 mb-1 w-12 flex-row rounded-[3px] py-2 shadow-sm'
      >
        {/* Fix button size does not equal with the Actions */}
        <RnText className='w-0 overflow-hidden leading-6'>{'\u200a'}</RnText>
        <RnIcon
          path={
            RnKeyboard.isKeyboardShowing
              ? mdiKeyboardOffOutline
              : mdiKeyboardOutline
          }
        />
      </RnTouchableOpacity>
    </AnimatedSize>
  )
})
