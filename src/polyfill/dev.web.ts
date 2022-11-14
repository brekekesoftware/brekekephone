export const _ = Object.assign(window, {
  __DEV__: process.env.NODE_ENV !== 'production',
})
