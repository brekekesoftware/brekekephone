// this file will also be used in babel plugin
// twrnc and platform specifics will be passed through options

import type { Platform } from 'react-native'

import type {
  ClassNameDarkModeSelector,
  ClassNameHandlerSelector,
  ClassNameMarker,
  ClassNameNative,
  ClassNamePlatformSelector,
  ClassNamePropsSelector,
  ClassNameResponsiveSelector,
  ClassNameSelector,
  ClassNameWithVariable,
} from '@/rn/core/tw/class-name'
import {
  animationMap,
  transitionDurationDefault,
  transitionTimingFunctionDefault,
  transitionTimingFunctionMap,
} from '@/rn/core/tw/lib/normalize-style-config'
import { camelCase } from '@/shared/lodash'
import type { Falsish, StrMap } from '@/shared/ts-utils'

type Options = {
  platform: Platform['OS']
  twrnc: Function
  className: string
  onUnknown?: (className: string) => never
}

const throwOnUnknown = (className: string) => {
  throw new Error(`Unknown or invalid class name ${className}`)
}
const space = /\s+/g

export const classNameToNative = (options: Options): ClassNameNative => {
  const required: Required<Options> = {
    ...options,
    onUnknown: options.onUnknown || throwOnUnknown,
  }
  const { twrnc, className, onUnknown } = required

  if (!className) {
    return
  }

  if (space.test(className)) {
    const style = className
      .split(space)
      .filter(s => s)
      .map(s => classNameToNative({ ...required, className: s }))
    return omitEmptyClassName(style)
  }

  let style: ClassNameNative = undefined
  for (const extra of extraTwrnc) {
    style = extra(required)
    if (style) {
      break
    }
  }

  if (!style) {
    const s = omitEmptyClassName(twrnc(className))

    if (typeof s === 'object' && s) {
      const variables: ClassNameWithVariable[] = []
      const regularStyle: StrMap = {}
      for (const [k, v] of Object.entries(s)) {
        if (typeof v === 'string' && v.startsWith('var(') && v.endsWith(')')) {
          const variable = v.slice(4, -1).trim()
          variables.push({
            key: k,
            variable,
          })
        } else {
          regularStyle[k] = v
        }
      }

      if (variables.length > 0) {
        const hasRegularStyle = Object.keys(regularStyle).length > 0
        if (variables.length === 1 && !hasRegularStyle) {
          style = variables[0]
        } else if (hasRegularStyle) {
          style = [regularStyle, ...variables]
        } else {
          style = variables
        }
      } else {
        style = regularStyle
      }
    }

    style = omitEmptyClassName(style)
    if (!style) {
      return onUnknown(className)
    }
  } else {
    style = omitEmptyClassName(style)
  }

  return style
}

export const stripSelector = (className: string, selector: string) => {
  let striped = ''
  const prefix = `${selector}:`
  if (className.startsWith(prefix)) {
    striped = className.replace(prefix, '')
  }
  const mid = `:${selector}:`
  if (className.includes(mid)) {
    striped = className.replace(mid, ':')
  }
  return striped
}

export const omitEmptyObject = <T extends object>(v: T | Falsish) => {
  if (!v) {
    return
  }
  let empty = true
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const k in v) {
    empty = false
    break
  }
  if (empty) {
    return
  }
  return v
}

const omitEmptyClassName = (className: ClassNameNative): ClassNameNative => {
  if (!className) {
    return
  }

  if (Array.isArray(className)) {
    className = className
      .flat(Infinity as 0)
      .map(omitEmptyClassName)
      .filter(v => v)
    if (className.length <= 1) {
      return className[0]
    }
    const styles: any[] = []
    const arr = className
    className = []
    for (const v of arr) {
      if (v && typeof v === 'object' && !('selector' in v || 'variable' in v)) {
        styles.push(v)
      } else {
        className.push(v)
      }
    }
    if (styles.length) {
      const flatten = Object.assign({}, ...styles)
      className.unshift(flatten)
    }
    if (className.length <= 1) {
      return className[0]
    }
    return className
  }

  if ('variable' in className) {
    return className
  }

  if ('selector' in className) {
    const style = omitEmptyClassName(className.style)
    if (!style) {
      return
    }
    return {
      selector: className.selector,
      style,
    }
  }

  return omitEmptyObject(className)
}

type ExtraTwrncOptions = Required<Options>
type ExtraTwrnc = (options: ExtraTwrncOptions) => any
const extraTwrnc: ExtraTwrnc[] = []

const stripNative = [
  /^theme-/,
  /^web:/,
  /^web-/,
  /^hover:/,
  /^group-[\w-]*hover:/,
  /^peer-[\w-]*hover:/,
  /^cursor-/,
]
extraTwrnc.push(options => {
  const { platform, className } = options
  const isNative = platform !== 'web'
  if (!isNative) {
    return
  }
  if (stripNative.some(r => r.test(className))) {
    return {}
  }
  return
})

const platformSelectorsTypeSafe: Record<ClassNamePlatformSelector, undefined> =
  {
    web: undefined,
    native: undefined,
    android: undefined,
    ios: undefined,
  }
export const platformSelectors = Object.keys(
  platformSelectorsTypeSafe,
) as ClassNamePlatformSelector[]
export const platformSelectorsSet = new Set<string>(platformSelectors)

const responsiveSelectorsTypeSafe: Record<
  ClassNameResponsiveSelector,
  undefined
> = {
  xs: undefined,
  sm: undefined,
  md: undefined,
  lg: undefined,
  xl: undefined,
  '2xl': undefined,
}
export const responsiveSelectors = Object.keys(
  responsiveSelectorsTypeSafe,
) as ClassNameResponsiveSelector[]
export const responsiveSelectorsSet = new Set<string>(responsiveSelectors)

const darkModeSelectorsTypeSafe: Record<ClassNameDarkModeSelector, undefined> =
  {
    dark: undefined,
    light: undefined,
  }
export const darkModeSelectors = Object.keys(
  darkModeSelectorsTypeSafe,
) as ClassNameDarkModeSelector[]
export const darkModeSelectorsSet = new Set<string>(darkModeSelectors)

const handlerSelectorsTypeSafe: Record<ClassNameHandlerSelector, undefined> = {
  active: undefined,
  focus: undefined,
}
export const handlerSelectors = Object.keys(
  handlerSelectorsTypeSafe,
) as ClassNameHandlerSelector[]
export const handlerSelectorsSet = new Set<string>(handlerSelectors)

const propsSelectorsTypeSafe: Record<ClassNamePropsSelector, undefined> = {
  disabled: undefined,
  checked: undefined,
}
export const propsSelectors = Object.keys(
  propsSelectorsTypeSafe,
) as ClassNamePropsSelector[]
export const propsSelectorsSet = new Set<string>(propsSelectors)

const selectors: ClassNameSelector[] = [
  ...platformSelectors,
  ...responsiveSelectors,
  ...darkModeSelectors,
  ...handlerSelectors,
  ...propsSelectors,
]
extraTwrnc.push(options => {
  const { platform, className } = options
  for (const selector of selectors) {
    const striped = stripSelector(className, selector)
    if (!striped) {
      continue
    }
    const style = classNameToNative({
      ...options,
      className: striped,
    })
    if (!style) {
      return {}
    }
    if (platformSelectorsSet.has(selector)) {
      if (
        selector === platform ||
        (selector === 'native' && platform !== 'web')
      ) {
        return {
          selector: true,
          style,
        }
      }
      return {}
    }
    return {
      selector,
      style,
    }
  }
  return
})

const markersTypeSafe: Record<ClassNameMarker, undefined> = {
  group: undefined,
  peer: undefined,
}
export const markers = Object.keys(markersTypeSafe) as ClassNameMarker[]
export const emptyMarkerKey = ''
const emptyMarkerStyle = {
  // to keep from omit empty style
  // will be removed in create class name component on selector traverse
  // empty -> marker provider
  // not empty -> marker selector
  [emptyMarkerKey]: true,
}
extraTwrnc.push(options => {
  const { className, onUnknown } = options
  for (const marker of markers) {
    if (className === marker) {
      return {
        selector: marker,
        style: emptyMarkerStyle,
      }
    }
    const prefix = `${marker}-`
    if (!className.startsWith(prefix)) {
      continue
    }
    const i = className.indexOf(':')
    if (i < 0) {
      return {
        selector: className,
        style: emptyMarkerStyle,
      }
    }
    const selector = className.slice(0, i)
    const next = className.slice(i + 1)
    if (!next) {
      return onUnknown(className)
    }
    const style = classNameToNative({
      ...options,
      className: next,
    })
    return {
      selector,
      style,
    }
  }
  return
})

// grid
// grid-cols-<number>
// grid-cols-none
extraTwrnc.push(options => {
  const { className, onUnknown } = options
  const grid = 'grid'
  if (className === grid) {
    return {
      grid: true,
    }
  }
  // only support cols
  const prefix = `${grid}-cols-`
  if (!className.startsWith(prefix)) {
    return
  }
  const striped = className.replace(prefix, '')
  const k = camelCase(prefix)
  if (striped === 'none') {
    return {
      [k]: undefined,
    }
  }
  if (striped.startsWith('[') && striped.endsWith(']')) {
    const tracks = striped
      .slice(1, -1)
      .split('_')
      .filter(v => v)
      .map(v => {
        const ty = v.slice(-2)
        if (ty !== 'px' && ty !== 'fr') {
          return onUnknown(className)
        }
        const n = Number(v.slice(0, -2))
        if (Number.isNaN(n)) {
          return onUnknown(className)
        }
        return {
          [ty]: n,
        }
      })
    if (!tracks.length) {
      return onUnknown(className)
    }
    return {
      [k]: tracks,
    }
  }
  const n = Number(striped)
  if (Number.isNaN(n)) {
    return onUnknown(className)
  }
  return {
    [k]: n,
  }
})

// transition
// transition-all
// transition-colors
// transition-opacity
// transition-shadow
// transition-transform
// transition-none
// transition-[<value>]
extraTwrnc.push(options => {
  const { className, onUnknown } = options
  let prefix = 'transition'
  if (!className.startsWith(prefix)) {
    return
  }
  // should keep these typings updated with the post-transpile runtime code
  type TransitionPropertyTw =
    | 'all'
    | 'colors'
    | 'opacity'
    | 'shadow'
    | 'transform'
    | 'none'
  type TransitionProperty = '' | TransitionPropertyTw | string[]
  const r = {
    transitionProperty: '' as TransitionProperty,
    transitionDuration: transitionDurationDefault,
    transitionTimingFunction: transitionTimingFunctionDefault,
  }
  if (className === prefix) {
    return r
  }
  prefix = `${prefix}-`
  if (!className.startsWith(prefix)) {
    return onUnknown(className)
  }
  const striped = className.replace(prefix, '') as TransitionPropertyTw
  const tailwind: Set<TransitionPropertyTw> = new Set([
    'all',
    'colors',
    'opacity',
    'shadow',
    'transform',
    'none',
  ])
  if (tailwind.has(striped)) {
    r.transitionProperty = striped
    return r
  }
  if (!(striped.startsWith('[') && striped.endsWith(']'))) {
    return onUnknown(className)
  }
  r.transitionProperty = striped.slice(1, -1).split(',').map(camelCase)
  return r
})

// duration-<number>
// duration-initial
extraTwrnc.push(options => {
  const { className, onUnknown } = options
  const prefix = 'duration-'
  if (!className.startsWith(prefix)) {
    return
  }
  const striped = className.replace(prefix, '')
  if (striped === 'initial') {
    return {
      transitionDuration: 0,
    }
  }
  const n = Number(striped)
  if (Number.isNaN(n)) {
    return onUnknown(className)
  }
  return {
    transitionDuration: n,
  }
})

// ease-linear
// ease-in
// ease-out
// ease-in-out
// ease-initial
extraTwrnc.push(options => {
  const { className, onUnknown } = options
  const prefix = 'ease-'
  if (!className.startsWith(prefix)) {
    return
  }
  const arr = new Set(
    [
      'linear',
      'in',
      'out',
      'in-out',
      'initial',
      ...Object.keys(transitionTimingFunctionMap),
    ].map(v => `${prefix}${v}`),
  )
  if (!arr.has(className)) {
    return onUnknown(className)
  }
  const striped = className.replace(prefix, '')
  if (striped === 'initial') {
    return {
      transitionTimingFunction: 'ease',
    }
  }
  if (striped === 'linear') {
    return {
      transitionTimingFunction: 'linear',
    }
  }
  return {
    transitionTimingFunction: className,
  }
})

// delay-<number>
extraTwrnc.push(options => {
  const { className, onUnknown } = options
  const prefix = 'delay-'
  if (!className.startsWith(prefix)) {
    return
  }
  const striped = className.replace(prefix, '')
  const n = Number(striped)
  if (Number.isNaN(n)) {
    return onUnknown(className)
  }
  return {
    transitionDelay: n,
  }
})

// animate-spin
// animate-ping
// animate-pulse
// animate-bounce
extraTwrnc.push(options => {
  const { className, onUnknown } = options
  const prefix = 'animate-'
  if (!className.startsWith(prefix)) {
    return
  }
  const arr = new Set(Object.keys(animationMap).map(v => `${prefix}${v}`))
  if (!arr.has(className)) {
    return onUnknown(className)
  }
  const striped = className.replace(prefix, '')
  return {
    animationName: striped,
  }
})

// line-clamp-<number>
// line-clamp-none
extraTwrnc.push(options => {
  const { className, onUnknown } = options
  const prefix = 'line-clamp-'
  if (!className.startsWith(prefix)) {
    return
  }
  const striped = className.replace(prefix, '')
  if (striped === 'none') {
    return {
      numberOfLines: undefined,
    }
  }
  const n = Number(striped)
  if (Number.isNaN(n)) {
    return onUnknown(className)
  }
  return {
    numberOfLines: n,
  }
})

// select-text
// select-none
extraTwrnc.push(options => {
  const { className, onUnknown } = options
  const prefix = 'select-'
  if (!className.startsWith(prefix)) {
    return
  }
  const striped = className.replace(prefix, '')
  if (striped !== 'none' && striped !== 'text') {
    return onUnknown(className)
  }
  return {
    selectable: striped === 'text',
  }
})

// placeholder-<color>
extraTwrnc.push(options => {
  const { twrnc, className, onUnknown } = options
  const prefix = 'placeholder-'
  if (!className.startsWith(prefix)) {
    return
  }
  const striped = className.replace(prefix, '')
  const style = twrnc(`text-${striped}`)
  if (!style?.color) {
    return onUnknown(className)
  }
  return {
    placeholderTextColor: style.color,
  }
})

// caret-transparent
extraTwrnc.push(options => {
  const { className } = options
  if (className !== 'caret-transparent') {
    return
  }
  return {
    caretHidden: true,
  }
})

// object-contain
// object-cover
// object-fill
// object-none
// object-scale-down
extraTwrnc.push(options => {
  const { className, onUnknown } = options
  const prefix = 'object-'
  if (!className.startsWith(prefix)) {
    return
  }
  const arr = new Set(
    ['contain', 'cover', 'fill', 'none', 'scale-down'].map(
      v => `${prefix}${v}`,
    ),
  )
  if (!arr.has(className)) {
    return onUnknown(className)
  }
  const striped = className.replace(prefix, '')
  return {
    resizeMode: striped,
  }
})

// alpha color
extraTwrnc.push(options => {
  const { className, onUnknown } = options
  const matches = /(.+)\/(\d+)$/.exec(className)
  if (!matches) {
    return
  }
  const [, color, a] = matches
  if (a.startsWith('0') && a !== '0') {
    return onUnknown(className)
  }
  const alpha = Number(a) / 100
  if (alpha > 1) {
    return onUnknown(className)
  }
  const style = classNameToNative({
    ...options,
    className: color,
  })
  if (!style || Array.isArray(style)) {
    return onUnknown(className)
  }
  if (!('variable' in style)) {
    return
  }
  style.alpha = alpha
  return style
})

// z index
extraTwrnc.push(options => {
  const { className, onUnknown } = options
  const matches = /^(-?)z-\[(\d+)\]$/.exec(className)
  if (!matches) {
    return
  }
  const [, negative, z] = matches
  const zIndex = Number(z) * (negative ? -1 : 1)
  if (z !== Math.abs(zIndex).toString()) {
    return onUnknown(className)
  }
  return {
    zIndex,
  }
})
