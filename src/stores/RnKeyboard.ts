import { action, observable } from 'mobx'
import { Keyboard } from 'react-native'

import { DEFAULT_TIMEOUT } from '#/config'
import { BackgroundTimer } from '#/utils/BackgroundTimer'

class RnKeyboardStore {
  @observable isKeyboardShowing = false
  @observable isKeyboardAnimating = false
  waitKeyboardTimeoutId = 0

  waitKeyboard =
    (fn: Function) =>
    (...args: unknown[]) => {
      if (this.waitKeyboardTimeoutId) {
        return
      }
      if (!this.isKeyboardShowing) {
        fn(...args)
        return
      }
      Keyboard.dismiss()
      this.waitKeyboardTimeoutId = BackgroundTimer.setTimeout(() => {
        this.waitKeyboardTimeoutId = 0
        fn(...args)
      }, DEFAULT_TIMEOUT)
    }

  keyboardAnimatingTimeoutId = 0
  @action setKeyboardAnimatingTimeout = () => {
    if (this.keyboardAnimatingTimeoutId) {
      BackgroundTimer.clearTimeout(this.keyboardAnimatingTimeoutId)
    }
    this.isKeyboardAnimating = true
    this.keyboardAnimatingTimeoutId = BackgroundTimer.setTimeout(
      action(() => {
        this.keyboardAnimatingTimeoutId = 0
        this.isKeyboardAnimating = false
      }),
      DEFAULT_TIMEOUT,
    )
  }
}

export const RnKeyboard = new RnKeyboardStore()

// ios
Keyboard.addListener(
  'keyboardWillShow',
  action(() => {
    RnKeyboard.setKeyboardAnimatingTimeout()
    RnKeyboard.isKeyboardShowing = true
  }),
)
Keyboard.addListener(
  'keyboardWillHide',
  action(() => {
    RnKeyboard.setKeyboardAnimatingTimeout()
    RnKeyboard.isKeyboardShowing = false
  }),
)

// android
Keyboard.addListener(
  'keyboardDidShow',
  action(() => {
    RnKeyboard.isKeyboardShowing = true
  }),
)
Keyboard.addListener(
  'keyboardDidHide',
  action(() => {
    RnKeyboard.isKeyboardShowing = false
  }),
)
