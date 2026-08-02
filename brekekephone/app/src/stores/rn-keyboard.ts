import { makeAutoObservable } from 'mobx'
import { Keyboard } from 'react-native'

import { defaultTimeout } from '@/config'
import { BackgroundTimer } from '@/utils/background-timer'

class RnKeyboardStore {
  constructor() {
    makeAutoObservable(this)
  }

  isKeyboardShowing = false
  isKeyboardAnimating = false
  // tracked on all android, consumed by Layout only on android 15+ (BUG-1220)
  keyboardHeight = 0
  // last non-zero keyboard height, kept after the keyboard hides so an in-app
  // panel (emoji picker) can size itself to match the keyboard area
  lastKeyboardHeight = 0
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
  setKeyboardAnimatingTimeout = () => {
    if (this.keyboardAnimatingTimeoutId) {
      BackgroundTimer.clearTimeout(this.keyboardAnimatingTimeoutId)
    }
    this.isKeyboardAnimating = true
    this.keyboardAnimatingTimeoutId = BackgroundTimer.setTimeout(() => {
      this.keyboardAnimatingTimeoutId = 0
      this.isKeyboardAnimating = false
    }, defaultTimeout)
  }
}

export const RnKeyboard = new RnKeyboardStore()

// ios
Keyboard.addListener('keyboardWillShow', e => {
  RnKeyboard.setKeyboardAnimatingTimeout()
  RnKeyboard.isKeyboardShowing = true
  if (e.endCoordinates?.height) {
    RnKeyboard.lastKeyboardHeight = e.endCoordinates.height
  }
})
Keyboard.addListener('keyboardWillHide', () => {
  RnKeyboard.setKeyboardAnimatingTimeout()
  RnKeyboard.isKeyboardShowing = false
})

// android
Keyboard.addListener('keyboardDidShow', e => {
  RnKeyboard.isKeyboardShowing = true
  RnKeyboard.keyboardHeight = e.endCoordinates.height
  if (e.endCoordinates.height) {
    RnKeyboard.lastKeyboardHeight = e.endCoordinates.height
  }
})
Keyboard.addListener('keyboardDidHide', () => {
  RnKeyboard.isKeyboardShowing = false
  RnKeyboard.keyboardHeight = 0
})
