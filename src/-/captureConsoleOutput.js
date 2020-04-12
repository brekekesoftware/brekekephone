import { Platform } from 'react-native'

// Write a log to console to note about this
console.info('captureConsoleOutput: console output is being captured!')

const customConsoleObject = ['debug', 'log', 'info', 'warn', 'error'].reduce(
  (m, k) => {
    const f = console[k].bind(console)
    m[k] =
      Platform.OS === 'web'
        ? f
        : // debugStore was added globally in src/global/debugStore.js so it can be used here
          (...args) => window.debugStore?.captureConsoleOutput(k, ...args)
    return m
  },
  {},
)

Object.entries(customConsoleObject).forEach(([k, v]) => {
  Object.defineProperty(console, k, {
    get() {
      return v
    },
    set() {
      // Prevent set to keep using our functions
    },
  })
})
