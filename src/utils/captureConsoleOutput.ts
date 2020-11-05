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
      const f = console[k as keyof typeof console].bind(console)
      m[k] =
        Platform.OS === 'web'
          ? (...args: unknown[]) =>
              f(
                ...args.map(a =>
                  // !a
                  //   ? `${a}`
                  //   : a.message && a.stack
                  //   ? a.message + ' ' + a.stack
                  //   : typeof a === 'object'
                  //   ? CircularJSON.stringify(a)
                  //   : `${a}`
                  a && typeof a === 'object'
                    ? CircularJSON.stringify(a)
                    : `${a}`,
                ),
              )
          : // debugStore was added globally in src/stores/debugStore.js so it can be used here
            (...args: unknown[]) =>
              window.debugStore?.captureConsoleOutput(k, ...args)
      m[`_${k}`] = f
      return m
    },
    {} as { [k: string]: () => void },
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
