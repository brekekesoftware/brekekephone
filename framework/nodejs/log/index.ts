import { bold, cyan, gray, magenta, red, yellow } from 'colors/safe'
import type { StackFrame } from 'stack-trace'
import stacktrace from 'stack-trace'

import { isInRepo, path } from '@/nodejs/path'
import { repoRoot } from '@/root'
import { jsonSafe } from '@/shared/json-safe'
import { get } from '@/shared/lodash'
import type { Falsish, Nullish } from '@/shared/ts-utils'

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

const levelLabelMap = {
  debug: '[DEBUG]',
  info: ' [INFO]',
  warn: ' [WARN]',
  error: '[ERROR]',
  fatal: '[FATAL]',
}
const levelColorFnMap = {
  debug: (v: string) => v,
  info: cyan,
  warn: yellow,
  error: red,
  fatal: magenta,
}
const levelPriorityMap = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
}

export class Log {
  level: LogLevel = 'debug'

  displayNodeModulesPath: boolean = true
  minimal: boolean = false

  cacheSize = 1000
  stdall: string[] = []
  stdout: string[] = []
  stderr: string[] = []

  stack = ((err: unknown, lv: LogLevel = 'error') => {
    if (!err) {
      return
    }
    lv = this.getLabel(lv) ? lv : 'error'
    const [msg, stack] = this.readError(err as Error)
    return this.println(lv, msg, stack)
  }) as <
    // add support for fatal return type: never
    T extends LogLevel = 'error',
  >(
    err: unknown,
    lv?: T,
  ) => T extends 'fatal' ? never : void

  private readError = (err: Error | Nullish) => {
    // common errors such as from sequelize, axios, graphql
    const keys = [
      'original',
      'originalError',
      'parent',
      'errors.0',
      'graphqlErrors.0',
    ]
    const withMsg = (m: Error | Nullish): Error | Nullish => {
      if (m?.message) {
        return m
      }
      const arr: (Error | Nullish)[] = keys.map(k => get(m, k))
      if (!arr.some(e => e)) {
        return
      }
      return arr.find(e => e?.message) || arr.map(withMsg).find(e => e?.message)
    }
    const errWithMsg = withMsg(err) || err
    const msg =
      errWithMsg?.message.replaceAll(repoRoot, '') ||
      '<UNKNOWN ERROR> ' + jsonSafe(err)
    return [msg, this.cleanupErrorStack(err)]
  }

  private createLogFn =
    (lv: LogLevel) =>
    (msg: string, condition: unknown = true) => {
      if (!condition || this.getPriority(lv) < this.getPriority()) {
        return
      }
      this.println(lv, msg, condition)
    }
  debug = this.createLogFn('debug')
  info = this.createLogFn('info')
  warn = this.createLogFn('warn')
  error = this.createLogFn('error')
  fatal = this.createLogFn('fatal') as (
    // add support for fatal return type: never
    msg: string,
    condition?: unknown,
  ) => never

  private cache = (k: 'stdall' | 'stdout' | 'stderr', msg: string) => {
    if (!this.cacheSize) {
      return
    }
    const arr = this[k]
    if (arr.length >= this.cacheSize) {
      arr.shift()
    }
    arr.push(msg)
  }

  private println = (lv: LogLevel, msg: string, condition: unknown) => {
    const color = this.getColorFn(lv)
    msg = this.colorize(msg, bold)
    msg = this.colorize(msg, color)
    const parts: string[] = []
    if (!this.minimal) {
      const timestamp = this.getTimestamp()
      const level = this.getLabel(lv)
      parts.push(this.colorize(`${timestamp} ${level} `, color))
      const location = this.getLocation(stacktrace.get()[2])
      parts.push(this.colorize(`${location} `, gray))
    }
    parts.push(msg)
    msg = parts.filter(m => m).join('')

    if (typeof condition === 'string') {
      const extra = condition.trim()
      condition = extra && this.colorize(extra, gray)
    } else if (condition instanceof Error) {
      condition = this.readError(condition).join('\n')
    } else if (typeof condition !== 'boolean') {
      condition = jsonSafe(condition)
    }
    if (typeof condition === 'string' && condition) {
      msg = msg + '\n' + condition
    }

    this.cache('stdall', msg)
    if (lv === 'error' || lv === 'fatal') {
      this.cache('stderr', msg)

      console.error(msg)
    } else {
      this.cache('stdout', msg)

      console.log(msg)
    }

    if (lv === 'fatal') {
      process.exit(1)
    }
  }

  color = true
  private colorize = (msg: string, fn: (v: string) => string) =>
    this.color ? fn(msg) : msg

  timezone = new Date().getTimezoneOffset() / -60
  private getTimestamp = () => {
    let date = new Date()
    const d = this.timezone * -60 + date.getTimezoneOffset()
    date = new Date(date.getTime() + d * 60 * 1000)
    return [
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
    ]
      .map((n, i) => {
        let s = ''
        if (n < 10) {
          s += '0'
        }
        s += n
        if (i < 2) {
          s += '/'
        } else if (i === 2) {
          s += ' '
        } else if (i < 5) {
          s += ':'
        }
        return s
      })
      .join('')
  }

  private getLocation = (frame: StackFrame) => {
    let fileName = frame.getFileName()
    if (!fileName) {
      return ''
    }
    const relative = (dir: string, p: string) =>
      path.relative(dir, p).replace(/^[\\/]*/, '')
    const shorten = (p: string) =>
      p.replace(/([\\/]).+([\\/][^\\/]+[\\/])/, '$1...$2')
    if (fileName.startsWith('node:')) {
      fileName = shorten(fileName.replace('node', ''))
    } else if (fileName.indexOf('node_modules') >= 0) {
      if (!this.displayNodeModulesPath) {
        return ''
      }
      const nm = fileName.substring(
        0,
        fileName.lastIndexOf('node_modules') + 12,
      )
      fileName = '~' + shorten(relative(nm, fileName))
    } else if (isInRepo(fileName)) {
      fileName = relative(repoRoot, fileName)
    } else {
      return ''
    }
    return `${fileName}:${frame.getLineNumber()}`
  }
  private cleanupErrorStack = (err: Error | Falsish) => {
    let maxFuncLength = 0
    type Stack = {
      fn: string
      location: string
    }
    const stacks: Stack[] = []
    const frames = err instanceof Error ? stacktrace.parse(err) : []
    frames.forEach(frame => {
      const location = this.getLocation(frame)
      if (!location) {
        return
      }
      let fn = frame.getFunctionName() || frame.getMethodName()
      fn = fn ? fn.replace(/\S+\./g, '') : '<anonnymous>'
      stacks.push({
        fn,
        location,
      })
      if (fn.length > maxFuncLength) {
        maxFuncLength = fn.length
      }
    })
    return stacks
      .map(s => `at ${s.fn.padEnd(maxFuncLength, ' ')} ${s.location}`)
      .join('\n')
  }
  private getLabel = (lv = this.level) => levelLabelMap[lv]
  private getColorFn = (lv = this.level) => levelColorFnMap[lv]
  private getPriority = (lv = this.level) => levelPriorityMap[lv]
}

export const log = new Log()

export const minimal = new Log()
minimal.minimal = true
