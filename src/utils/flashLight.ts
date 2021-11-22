import { NativeModules, Platform } from 'react-native'

import { BackgroundTimer } from './BackgroundTimer'
import { BrekekeUtils } from './RnNativeModules'

const { BrekekeModule } = NativeModules
export const startFlashLight = (duration: number = 1000) => {
  if (Platform.OS === 'web') {
    return
  }
  const switchState =
    Platform.OS === 'android'
      ? BrekekeUtils.switchState
      : BrekekeModule.switchState
  switchState(true)
  BackgroundTimer.setTimeout(() => {
    switchState(false)
  }, duration)
}
