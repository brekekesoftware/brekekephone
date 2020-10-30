import './__keyboard'
import './__stacker'
import './_profiles'

import { BackHandler, Keyboard } from 'react-native'

import v from '../variables'
import g from './_'
import Alert from './Alert'
import Picker from './Picker'

g.extends(v)

// Handle android hardware back button press
BackHandler.addEventListener('hardwareBackPress', () => {
  if (g.isKeyboardShowing) {
    Keyboard.dismiss()
    return true
  }
  if (Alert.alerts.length) {
    Alert.dismiss()
    return true
  }
  if (Picker.currentPicker) {
    Picker.dismiss()
    return true
  }
  if (g.stacks.length > 1) {
    g.stacks.pop()
    return true
  }
  return false
})

export default g
