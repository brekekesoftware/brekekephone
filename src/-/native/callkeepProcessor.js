import { Platform } from 'react-native'

export const initCallKeepProcessor = () => {
  if (Platform.OS === 'web') {
    return
  }
  setInterval(() => {
    // TODO
  }, 300)
}
