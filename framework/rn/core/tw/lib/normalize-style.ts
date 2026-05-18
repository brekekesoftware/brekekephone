import {
  animationMap,
  transitionTimingFunctionMap,
} from '@/rn/core/tw/lib/normalize-style-config'
import { isWeb } from '@/rn/core/utils/platform'
import { camelCase } from '@/shared/lodash'
import type { Falsish, FnAny, StrMap } from '@/shared/ts-utils'

type Style = StrMap &
  Partial<{
    marker: true
    transitionProperty: string | string[]
    transitionTimingFunction: string | string[]
    animationName: string
  }>

// style should be flatten already in create class name component
export const normalizeStyle: FnAny = (style: Style | Falsish) => {
  if (!style) {
    return
  }

  if (isWeb) {
    if ('numberOfLines' in style) {
      const v = style.numberOfLines
      delete style.numberOfLines
      style.overflow = v === undefined ? 'visible' : 'hidden'
      style.display = v === undefined ? 'block' : '-webkit-box'
      style.webkitBoxOrient = v === undefined ? 'horizontal' : 'vertical'
      style.webkitLineClamp = v === undefined ? 'unset' : v
    }
    if ('selectable' in style) {
      const v = style.selectable
      delete style.selectable
      style.userSelect = v ? 'text' : 'none'
    }
    if ('placeholderTextColor' in style) {
      delete style.placeholderTextColor
    }
    if ('caretHidden' in style) {
      delete style.caretHidden
      style.caretColor = 'transparent'
    }
    if ('resizeMode' in style) {
      const v = style.resizeMode
      delete style.resizeMode
      style.objectFit = v
    }
    // TODO: handle other cases on web for runtime style
  }

  delete style.marker

  if ('transitionProperty' in style) {
    const v = style.transitionProperty as string
    style.transitionProperty = Array.isArray(v) ? v : transitionMap[v] || v
  }

  if ('transitionTimingFunction' in style) {
    const v = style.transitionTimingFunction as string
    style.transitionTimingFunction = (
      Array.isArray(v)
        ? v.map(t => transitionTimingFunctionMap[t] || t)
        : transitionTimingFunctionMap[v] || v
    ) as string
  }

  if ('animationName' in style) {
    const v = style.animationName as string
    Object.assign(style, animationMap[v])
  }
}

// data copied from tailwind
// commented out incompatible values in react native

const transitionColors = [
  'color',
  'background-color',
  'border-color',
  'outline-color',
  'text-decoration-color',
  // 'fill',
  // 'stroke',
  // '--tw-gradient-from',
  // '--tw-gradient-via',
  // '--tw-gradient-to',
].map(camelCase)
const transitionOpacity = [
  'opacity',
  //
].map(camelCase)
const transitionShadow = [
  'box-shadow',
  //
].map(camelCase)
const transitionTransform = [
  'transform',
  'translate',
  'scale',
  'rotate',
  // from react native:
  'translateX',
  'translateY',
  'scaleX',
  'scaleY',
  'rotation',
].map(camelCase)
const transitionWildcard = [
  ...transitionColors,
  ...transitionOpacity,
  ...transitionShadow,
  ...transitionTransform,
]
const transitionMap: StrMap<string[] | undefined> = {
  '': transitionWildcard,
  colors: transitionColors,
  opacity: transitionOpacity,
  shadow: transitionShadow,
  transform: transitionTransform,
  // all and none are supported by reanimated
  // we can keep the string value
  all: undefined,
  none: undefined,
}
