import { BackgroundTimer } from '../utils/BackgroundTimer'
import { getAuthStore } from './authStore'

export const reconnectAndWaitSip = (fn: Function) => {
  getAuthStore().reconnectWithSetStates()
  const at = Date.now()
  const id = BackgroundTimer.setInterval(() => {
    const enoughTimePassed = Date.now() > at + 10000
    const isSipConnected = getAuthStore().sipState === 'success'
    if (enoughTimePassed || isSipConnected) {
      BackgroundTimer.clearInterval(id)
    }
    if (!enoughTimePassed && isSipConnected) {
      fn()
    }
  }, 300)
}
