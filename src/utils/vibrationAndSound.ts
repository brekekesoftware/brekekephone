import { Vibration } from 'react-native'

import ding from '../assets/ding.mp3'
import { BackgroundTimer } from './BackgroundTimer'

export const playDing = () => {
  const a = new Audio()
  a.volume = 0.05
  a.src = ding
  document.body.appendChild(a)
  a.play()
  BackgroundTimer.setTimeout(() => {
    document.body.removeChild(a)
  }, 3000)
}
export const vibration = () => {
  Vibration.vibrate(1000)
}

// export const ringOrVibration = () => {
//   if (Platform.OS === 'web') {
//     playDing()
//   } else {
//     if(chatStore.isPauseTingTing){
//       chatStore.isPauseTingTing = false
//       vibration()
//     }

//   }
// }
