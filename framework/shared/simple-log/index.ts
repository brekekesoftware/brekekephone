import type { Log } from '@/nodejs/log'
import { jsonSafe } from '@/shared/json-safe'

type Level = 'debug' | 'info' | 'warn' | 'error'
const createSimpleLog =
  (l: Level) =>
  (msg: string, condition: unknown = true) => {
    if (!condition) {
      return
    }
    if (typeof condition !== 'boolean') {
      condition = jsonSafe(condition)
    }
    if (typeof condition === 'string') {
      msg = msg + '\n' + condition.trim()
    }

    const fn = console[l].bind(console)
    fn(msg)
    if (condition instanceof Error) {
      fn(condition)
    }
  }

// for non-nodejs env such as react native or browser
export type SimpleLog = Pick<Log, Level>
export const simpleLog: SimpleLog = {
  debug: createSimpleLog('debug'),
  info: createSimpleLog('info'),
  warn: createSimpleLog('warn'),
  error: createSimpleLog('error'),
}
