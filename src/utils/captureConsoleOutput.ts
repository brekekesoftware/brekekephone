import CircularJSON from 'circular-json'
import { Platform } from 'react-native'

const formatErrors = (...errs: Error[]) =>
  errs
    .map(e =>
      !e
        ? `${e}`
        : e.message
        ? e.message
        : typeof e === 'object'
        ? CircularJSON.stringify(e)
        : `${e}`,
    )
    .join(' ')
    .replace(/\s*@.+/, '')
    .replace(/\s*at\s.+/, '')
    .replace(/\s+/g, ' ')

const customConsoleObject = ['debug', 'log', 'info', 'warn', 'error'].reduce(
  (m, k) => {
    const f0 = console[k as keyof Console] as Function
    const f = f0.bind(console) as Function
    m[k] =
      Platform.OS === 'web' || process.env.NODE_ENV !== 'production'
        ? (...args: Error[]) => f(formatErrors(...args))
        : (...args: Error[]) =>
            // debugStore was added globally in src/stores/debugStore.js
            //    so it can be used here
            window.debugStore?.captureConsoleOutput(k, formatErrors(...args))
    return m
  },
  {} as { [k: string]: Function },
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

// Write a log to console to note about this
console.info('captureConsoleOutput: console output is being captured!')
