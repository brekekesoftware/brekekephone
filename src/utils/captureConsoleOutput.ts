import CircularJSON from 'circular-json'
import moment from 'moment'
import { Platform } from 'react-native'
import { format } from 'util'

import { sipErrorEmitter } from '../stores/sipErrorEmitter'

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
  // Remove %c on web from the debug lib
  if (Platform.OS === 'web') {
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
    msgs = msgs.filter((m0, i) => !m[i])
  }
  // Apply format and remove whitespaces
  let msg = format(tpl, ...msgs)
    .replace(/\s+/g, ' ')
    .trim()
  // Remove stack trace and cleanup output from lib `debug` in jssip
  msg = msg.replace(/((\s+@\s+)|( : \w+@index)|(\W\w*@http)).+/, '')
  msg = msg.replace(/ : Error at \w+\.log \(http.+/, '')
  msg = msg.replace(/^.+\[(trial|debug|log|info|warn|error)\]\s*/, '')
  // SIP error emitter
  if (msg.indexOf('JsSIP:Transport reconnection attempt') >= 0) {
    sipErrorEmitter.emit('error', null)
  }
  // RN 0.65 warning
  if (msg.indexOf('`new NativeEventEmitter()` was called') >= 0) {
    return
  }
  return msg
}

const captureConsoleOutput = () => {
  if (Platform.OS === 'web' && !window._BrekekePhoneCaptureConsole) {
    return
  }
  const customConsoleObject = ['debug', 'log', 'info', 'warn', 'error'].reduce(
    (m, k) => {
      const f0 = console[k as keyof Console] as Function
      const f = f0.bind(console) as Function
      m[k] =
        Platform.OS === 'web' || process.env.NODE_ENV !== 'production'
          ? (...args: Error[]) => {
              const msg = formatErrors(...args)
              // add timestamp on dev (prod already added in debugStore)
              if (msg) {
                f(moment().format('YYYY/MM/DD HH:mm:ss.SSS') + ' ' + msg)
              }
            }
          : (...args: Error[]) => {
              // debugStore was added globally in src/stores/debugStore.ts
              //    so it can be used here
              const msg = formatErrors(...args)
              if (msg) {
                window.debugStore?.captureConsoleOutput(k, msg)
              }
            }
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
}

captureConsoleOutput()
