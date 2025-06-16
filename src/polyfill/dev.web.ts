declare global {
  interface Window {
    __DEV__: boolean
  }
}
window.__DEV__ = process.env.NODE_ENV !== 'production'

export const _ = undefined
