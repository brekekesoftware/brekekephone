import { BackgroundTimer } from '../utils/BackgroundTimer'
import { AccountData, AccountUnique } from './accountStore'
import { AuthStore } from './authStore2'

// circular dep
let authStore: AuthStore
export const setAuthStore = (s: AuthStore) => {
  authStore = s
}
export const getAuthStore = () => authStore

export type RecentCall = AccountData['recentCalls'][0]

const compareField = (p1: object, p2: object, field: keyof AccountUnique) => {
  const v1 = p1[field as keyof typeof p1]
  const v2 = p2[field as keyof typeof p2]
  return !v1 || !v2 || v1 === v2
}
export const compareAccount = (p1: { pbxUsername: string }, p2: object) => {
  return (
    p1.pbxUsername && // Must have pbxUsername
    compareField(p1, p2, 'pbxUsername') &&
    compareField(p1, p2, 'pbxTenant') &&
    compareField(p1, p2, 'pbxHostname') &&
    compareField(p1, p2, 'pbxPort')
  )
}

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
