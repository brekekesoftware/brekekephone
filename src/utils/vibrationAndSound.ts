import { Platform, Vibration } from 'react-native'

import ding from '../assets/ding.mp3'

export const playDing = () => {
  const a = new Audio()
  a.volume = 0.05
  a.src = ding
  document.body.appendChild(a)
  a.play()
  setTimeout(() => {
    document.body.removeChild(a)
  }, 3000)
}
export const vibration = () => {
  Vibration.vibrate(1000)
}

export const ringOrVibration = () => {
  if (Platform.OS === 'web') {
    playDing()
  } else {
    vibration()
  }
}
