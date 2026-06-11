import type { ClassNameCalc } from '@/rn/core/tw/class-name'
import type { ExtraTwrncOptions } from '@/rn/core/tw/lib/class-name-to-native'
import type { StrMap } from '@/shared/ts-utils'

type CalcToken =
  | {
      k: 'value'
      v: number
      unit?: 'vw' | 'vh'
    }
  | {
      k: 'op'
      op: '+' | '-' | '*' | '/'
    }

export const classNameCalc = (input: string): ClassNameCalc | undefined => {
  const tokens = classNameCalcTokenize(input.replace(/_/g, ' ').trim())
  if (!tokens || !tokens.length) {
    return undefined
  }
  let pos = 0

  // parse atom
  const atom = (): ClassNameCalc | undefined => {
    const t = tokens[pos]
    if (!t || t.k !== 'value') {
      return undefined
    }
    pos++
    return {
      v: t.v,
      unit: t.unit,
    }
  }

  // parse mul and div
  const mulDiv = (): ClassNameCalc | undefined => {
    let l = atom()
    if (!l) {
      return undefined
    }
    while (pos < tokens.length) {
      const t = tokens[pos]
      if (!t || t.k !== 'op' || (t.op !== '*' && t.op !== '/')) {
        break
      }
      pos++
      const r = atom()
      if (!r) {
        return undefined
      }
      l = {
        l,
        r,
        op: t.op,
      }
    }
    return l
  }

  // parse add and sub
  const addSub = (): ClassNameCalc | undefined => {
    let l = mulDiv()
    if (!l) {
      return undefined
    }
    while (pos < tokens.length) {
      const t = tokens[pos]
      if (!t || t.k !== 'op' || (t.op !== '+' && t.op !== '-')) {
        break
      }
      pos++
      const r = mulDiv()
      if (!r) {
        return undefined
      }
      l = {
        l,
        r,
        op: t.op,
      }
    }
    return l
  }

  const res = addSub()
  return pos === tokens.length ? res : undefined
}

const classNameCalcTokenize = (expr: string): CalcToken[] | undefined => {
  const tokens: CalcToken[] = []
  let i = 0
  while (i < expr.length) {
    if (expr[i] === ' ') {
      i++
      continue
    }
    const m = /^(\d+(?:\.\d+)?)/.exec(expr.slice(i))
    if (m) {
      const v = Number(m[0])
      i += m[0].length
      const unit = expr.slice(i, i + 2)
      if (unit === 'vw' || unit === 'vh') {
        tokens.push({
          k: 'value',
          v,
          unit,
        })
        i += 2
      } else if (unit === 'px') {
        tokens.push({
          k: 'value',
          v,
        })
        i += 2
      } else {
        tokens.push({
          k: 'value',
          v,
        })
      }
      continue
    }
    const op = expr[i]
    if (op === '+' || op === '-' || op === '*' || op === '/') {
      tokens.push({
        k: 'op',
        op,
      })
      i++
      continue
    }
    return undefined
  }
  return tokens
}

type CalcKeysOptions = ExtraTwrncOptions & {
  // pass here to avoid circular deps
  classNameToNative: Function
  re: RegExp
}
export const classNameCalcKeys = ({
  classNameToNative,
  re,
  ...options
}: CalcKeysOptions) => {
  const { className, onUnknown } = options
  const style = classNameToNative({
    ...options,
    className: className.replace(re, '-0'),
  })
  if (!style || Array.isArray(style)) {
    return onUnknown(className)
  }
  let keys = Object.keys(style)
  if (keys.includes('fontSize')) {
    keys = keys.filter(k => k !== 'lineHeight')
  }
  if (!keys.length) {
    return onUnknown(className)
  }
  return keys
}

export const classNameCalcScreens: StrMap<{ unit: 'vw' | 'vh'; key: string }> =
  {
    'w-screen': { unit: 'vw', key: 'width' },
    'h-screen': { unit: 'vh', key: 'height' },
    'min-w-screen': { unit: 'vw', key: 'minWidth' },
    'min-h-screen': { unit: 'vh', key: 'minHeight' },
    'max-w-screen': { unit: 'vw', key: 'maxWidth' },
    'max-h-screen': { unit: 'vh', key: 'maxHeight' },
  }
