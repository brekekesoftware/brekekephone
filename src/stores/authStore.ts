import { AuthStore } from './authStore2'

// circular dep
let authStore: AuthStore
export const setAuthStore = (s: AuthStore) => {
  authStore = s
}
export const getAuthStore = () => authStore

const compareField = (p1: object, p2: object, field: string) => {
  const v1 = p1[field as keyof typeof p1]
  const v2 = p2[field as keyof typeof p2]
  return !v1 || !v2 || v1 === v2
}
export const compareProfile = (p1: { pbxUsername: string }, p2: object) => {
  return (
    p1.pbxUsername && // Must have pbxUsername
    compareField(p1, p2, 'pbxUsername') &&
    compareField(p1, p2, 'pbxTenant') &&
    compareField(p1, p2, 'pbxHostname') &&
    compareField(p1, p2, 'pbxPort')
  )
}
