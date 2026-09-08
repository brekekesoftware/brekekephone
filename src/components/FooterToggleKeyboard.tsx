import { observer } from 'mobx-react'
import type { FC } from 'react'
import { Keyboard, StyleSheet } from 'react-native'

import { mdiKeyboardOffOutline, mdiKeyboardOutline } from '#/assets/icons'
import { AnimatedSize } from '#/components/AnimatedSize'
import { RnIcon, RnText, RnTouchableOpacity } from '#/components/Rn'
import { v } from '#/components/variables'
import { isWeb } from '#/config'
import { RnKeyboard } from '#/stores/RnKeyboard'

const css = StyleSheet.create({
  ToggleKeyboard: {
    flexDirection: 'row',
    marginRight: 8,
    marginBottom: 4,
    borderRadius: v.borderRadius,
    paddingVertical: 8,
    width: v.iconSize + 24,
    backgroundColor: v.hoverBg,
    ...v.boxShadow,
  },
  Text: {
    /* Fix button size does not equal with the Actions */
    width: 0,
    lineHeight: v.iconSize,
    overflow: 'hidden',
  },
})

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
        style={css.ToggleKeyboard}
      >
        {/* Fix button size does not equal with the Actions */}
        <RnText style={css.Text}>{'\u200a'}</RnText>
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
