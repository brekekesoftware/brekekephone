import { observer } from 'mobx-react'
import type { FC } from 'react'
import { Keyboard } from 'react-native'
import { mdiKeyboardOffOutline, mdiKeyboardOutline } from '#/assets/icons'
import { AnimatedSize } from '#/components/animated-size'
import { RnIcon, RnText, RnTouchableOpacity } from '#/components/rn'
import { isWeb } from '#/config'
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
        className='flex-row mr-2 mb-1 py-2 w-12 rounded-[3px] bg-muted shadow-sm'
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
