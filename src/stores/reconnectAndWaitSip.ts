import { AuthStore } from './authStore'

// circular dep
let authStore: AuthStore = null!
export const setAuthStore = (s: AuthStore) => {
  authStore = s
}

export const reconnectAndWaitSip = (fn: Function) => {
  authStore.reconnectWithSetStates()
  const at = Date.now()
  const id = setInterval(() => {
    if (Date.now() > at + 10000) {
      clearInterval(id)
    } else if (authStore.sipState === 'success') {
      clearInterval(id)
      fn()
    }
  }, 100)
}
