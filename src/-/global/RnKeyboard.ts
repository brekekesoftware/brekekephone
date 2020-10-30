import { observable } from 'mobx'
import { Keyboard } from 'react-native'

class KeyboardStore {
  @observable isKeyboardShowing = false
  @observable isKeyboardAnimating = false
  waitKeyboardTimeoutId = 0

  waitKeyboard = (fn: Function) => (...args: unknown[]) => {
    if (this.waitKeyboardTimeoutId) {
      return
    }
    if (!this.isKeyboardShowing) {
      fn(...args)
      return
    }
    Keyboard.dismiss()
    this.waitKeyboardTimeoutId = window.setTimeout(() => {
      this.waitKeyboardTimeoutId = 0
      fn(...args)
    }, 300)
  }

  keyboardAnimatingTimeoutId = 0
  setKeyboardAnimatingTimeout = () => {
    if (this.keyboardAnimatingTimeoutId) {
      clearTimeout(this.keyboardAnimatingTimeoutId)
    }
    this.isKeyboardAnimating = true
    this.keyboardAnimatingTimeoutId = window.setTimeout(() => {
      this.keyboardAnimatingTimeoutId = 0
      this.isKeyboardAnimating = false
    }, 300)
  }
}

const RnKeyboard = new KeyboardStore()
export default RnKeyboard

// ios
Keyboard.addListener('keyboardWillShow', () => {
  RnKeyboard.setKeyboardAnimatingTimeout()
  RnKeyboard.isKeyboardShowing = true
})
Keyboard.addListener('keyboardWillHide', () => {
  RnKeyboard.setKeyboardAnimatingTimeout()
  RnKeyboard.isKeyboardShowing = false
})

// android
Keyboard.addListener('keyboardDidShow', () => {
  RnKeyboard.isKeyboardShowing = true
})
Keyboard.addListener('keyboardDidHide', () => {
  RnKeyboard.isKeyboardShowing = false
})
