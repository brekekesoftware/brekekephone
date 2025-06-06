import BgTimer from 'react-native-background-timer'

import { isWeb } from '../config'

export type TBackgroundTimer = {
  setTimeout(callback: () => void, timeout: number): number
  clearTimeout(timeoutId: number): void
  setInterval(callback: () => void, timeout: number): number
  clearInterval(intervalId: number): void
}

export const BackgroundTimer: TBackgroundTimer = isWeb ? window : BgTimer
