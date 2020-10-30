import './__stacker'
import './_profiles'

import { BackHandler, Keyboard } from 'react-native'

import v from '../variables'
import g from './_'
import RnAlert from './RnAlert'
import RnKeyboard from './RnKeyboard'
import RnPicker from './RnPicker'

g.extends(v)

// Handle android hardware back button press
BackHandler.addEventListener('hardwareBackPress', () => {
  if (RnKeyboard.isKeyboardShowing) {
    Keyboard.dismiss()
    return true
  }
  if (RnAlert.alerts.length) {
    RnAlert.dismiss()
    return true
  }
  if (RnPicker.currentRnPicker) {
    RnPicker.dismiss()
    return true
  }
  if (g.stacks.length > 1) {
    g.stacks.pop()
    return true
  }
  return false
})

export default g
