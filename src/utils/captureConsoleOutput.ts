import CircularJSON from 'circular-json'
import { Platform } from 'react-native'

const captureConsoleOutput = () => {
  if (process.env.NODE_ENV !== 'production') {
    return
  }
  // Write a log to console to note about this
  console.info('captureConsoleOutput: console output is being captured!')

  const customConsoleObject = ['debug', 'log', 'info', 'warn', 'error'].reduce(
    (m, k) => {
      const f0 = console[k as keyof Console] as Function
      const f = f0.bind(console) as Function
      m[k] =
        Platform.OS === 'web'
          ? (...args: Error[]) =>
              f(
                ...args.map(a =>
                  !a
                    ? `${a}`
                    : a.message
                    ? a.message
                    : typeof a === 'object'
                    ? CircularJSON.stringify(a)
                    : `${a}`,
                ),
              )
          : (...args: Error[]) =>
              // debugStore was added globally in src/stores/debugStore.js
              //    so it can be used here
              window.debugStore?.captureConsoleOutput(k, ...args)
      m[`_${k}`] = f
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
}

captureConsoleOutput()
