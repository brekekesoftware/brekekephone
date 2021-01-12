import CircularJSON from 'circular-json'
import { Platform } from 'react-native'
import { format } from 'util'

const formatErrors = (...errs: Error[]) => {
  // Normalize and fix circular json
  let msgs = errs.map(e =>
    !e
      ? `${e}`
      : e.message
      ? e.message
      : typeof e === 'object'
      ? CircularJSON.stringify(e)
      : `${e}`,
  )
  let tpl = msgs.shift() || ''
  // Remove %c for the debug lib
  const m: { [k: number]: boolean } = {}
  const regex = /%\w/g
  let mi = 0
  let match: RegExpExecArray | null = null
  while ((match = regex.exec(tpl)) !== null) {
    if (match[0] === '%c') {
      m[mi] = true
    }
    mi++
  }
  tpl = tpl.replace(/%c/g, '')
  msgs = msgs.filter((_, i) => !m[i])
  // More cleanup for the debug lib
  let msg = format(tpl, ...msgs)
  const i = /\W(@|at)(\W|http)/.exec(msg)?.index || -1
  if (i >= 0) {
    msg = msg.substr(0, i + 1)
  }
  msg = msg
    .replace(/^.+\[(trial|debug|log|info|warn|error)\]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
  return msg
}

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
