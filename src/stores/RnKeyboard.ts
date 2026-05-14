import { action, observable } from 'mobx'
import { Keyboard } from 'react-native'

import { defaultTimeout } from '#/config'
import { BackgroundTimer } from '#/utils/BackgroundTimer'

class RnKeyboardStore {
  @observable isKeyboardShowing = false
  @observable isKeyboardAnimating = false
  // tracked on all android, consumed by Layout only on android 15+ (BUG-1220)
  @observable keyboardHeight = 0
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
      }, defaultTimeout)
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
      defaultTimeout,
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
  action(e => {
    RnKeyboard.isKeyboardShowing = true
    RnKeyboard.keyboardHeight = e.endCoordinates.height
  }),
)
Keyboard.addListener(
  'keyboardDidHide',
  action(() => {
    RnKeyboard.isKeyboardShowing = false
    RnKeyboard.keyboardHeight = 0
  }),
)
