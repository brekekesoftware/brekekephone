import { BackgroundTimer } from '../utils/BackgroundTimer'
import { AuthStore } from './authStore2'

// circular dep
let authStore: AuthStore
export const setAuthStore = (s: AuthStore) => {
  authStore = s
}
export const getAuthStore = () => authStore

export const reconnectAndWaitSip = async () => {
  authStore.reconnectSip()
  await waitSip()
}

const wait = (
  fn: Function,
  name: 'pbxState' | 'sipState' | 'ucState',
  time = 10000,
) => {
  const at = Date.now()
  if (authStore[name] === 'success') {
    fn(true)
    return
  }
  const id = BackgroundTimer.setInterval(() => {
    const enoughTimePassed = Date.now() - at > time
    const isConnected = authStore[name] === 'success'
    if (enoughTimePassed || isConnected) {
      BackgroundTimer.clearInterval(id)
      fn(isConnected)
    }
  }, 500)
}

export const waitPbx = (time?: number) =>
  new Promise(r => wait(r, 'pbxState', time))
export const waitSip = (time?: number) =>
  new Promise(r => wait(r, 'sipState', time))
export const waitUc = (time?: number) =>
  new Promise(r => wait(r, 'ucState', time))
