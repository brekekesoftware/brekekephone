import { BackgroundTimer } from '../utils/BackgroundTimer'
import type { AuthStore } from './authStore2'

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
  if (authStore[name] === 'success') {
    fn(true)
    return
  }
  const at = Date.now()
  const id = BackgroundTimer.setInterval(() => {
    if (authStore[name] === 'success') {
      BackgroundTimer.clearInterval(id)
      fn(true)
    } else if (Date.now() - at > time) {
      BackgroundTimer.clearInterval(id)
      fn(false)
    }
  }, 500)
}

export const waitPbx = (time?: number) =>
  new Promise(r => wait(r, 'pbxState', time))
export const waitSip = (time?: number) =>
  new Promise(r => wait(r, 'sipState', time))
export const waitUc = (time?: number) =>
  new Promise(r => wait(r, 'ucState', time))
