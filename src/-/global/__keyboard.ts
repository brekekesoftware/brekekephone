import { Keyboard } from 'react-native'

import $ from './_'

$.extends({
  observable: {
    isKeyboardShowing: false,
    isKeyboardAnimating: false,
  },
  waitKeyboardTimeoutId: 0,
  waitKeyboard: fn => (...args) => {
    if ($.waitKeyboardTimeoutId) {
      return
    }
    if (!$.isKeyboardShowing) {
      fn(...args)
      return
    }
    Keyboard.dismiss()
    $.waitKeyboardTimeoutId = window.setTimeout(() => {
      $.waitKeyboardTimeoutId = 0
      fn(...args)
    }, 300)
  },
})

let keyboardAnimatingTimeoutId = 0
const setKeyboardAnimatingTimeout = () => {
  if (keyboardAnimatingTimeoutId) {
    clearTimeout(keyboardAnimatingTimeoutId)
  }
  $.isKeyboardAnimating = true
  keyboardAnimatingTimeoutId = window.setTimeout(() => {
    keyboardAnimatingTimeoutId = 0
    $.isKeyboardAnimating = false
  }, 300)
}

// ios
Keyboard.addListener('keyboardWillShow', () => {
  setKeyboardAnimatingTimeout()
  $.isKeyboardShowing = true
})
Keyboard.addListener('keyboardWillHide', () => {
  setKeyboardAnimatingTimeout()
  $.isKeyboardShowing = false
})

// android
Keyboard.addListener('keyboardDidShow', () => {
  $.isKeyboardShowing = true
})
Keyboard.addListener('keyboardDidHide', () => {
  $.isKeyboardShowing = false
})
