import { observer } from 'mobx-react'
import type { FC } from 'react'
import { Keyboard } from 'react-native'
import { mdiKeyboardOffOutline, mdiKeyboardOutline } from '#/assets/icons'
import { AnimatedSize } from '#/components/animated-size'
import { RnIcon, RnText, RnTouchableOpacity } from '#/components/rn'
import { v } from '#/components/variables'
import { isWeb } from '#/config'
import { RnKeyboard } from '#/stores/rn-keyboard'

const css = {
  ToggleKeyboard: {
    borderRadius: v.borderRadius,
    backgroundColor: v.hoverBg,
    ...v.boxShadow,
  },
}

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
        className='flex-row mr-2 mb-1 py-2 w-12'
        style={css.ToggleKeyboard}
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
