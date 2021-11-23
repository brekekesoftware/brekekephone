import { NativeModules, Platform } from 'react-native'

import { BackgroundTimer } from './BackgroundTimer'
import { BrekekeUtils } from './RnNativeModules'

const { BrekekeModule } = NativeModules
export const openFlashLight = (isOn: Boolean = true) => {
  if (Platform.OS === 'web') {
    return
  }
  const switchState =
    Platform.OS === 'android'
      ? BrekekeUtils.switchState
      : BrekekeModule.switchState

  switchState(isOn)
}
