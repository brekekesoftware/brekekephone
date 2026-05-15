import type {
  ClassName,
  ClassNameState,
  ClassNameWithSelector,
  Style,
  StyleSingle,
} from '@/rn/core/tw/class-name'
import { omitEmptyObject } from '@/rn/core/tw/lib/class-name-to-native'
import type { ClassNameToStylesOptions } from '@/rn/core/tw/lib/class-name-to-styles'
import { classNameToStyles } from '@/rn/core/tw/lib/class-name-to-styles'
import { normalizeStyle } from '@/rn/core/tw/lib/normalize-style'

type Options = Partial<
  Omit<ClassNameToStylesOptions, 'className'> &
    Pick<ClassNameToStylesOptions, 'variables'> & {
      state: ClassNameState
      style: Style
    }
>

export const runtimeStyle = (
  className: ClassName,
  { state, variables, style, onSelector, ...options }: Options = {},
): StyleSingle | undefined => {
  const styles = classNameToStyles({
    className,
    variables,
    onSelector:
      onSelector ||
      (selector => defaultOnSelector({ className: selector, state })),
    ...options,
  })

  if (Array.isArray(style)) {
    style = style.flat(Infinity as 0).filter(v => v)
    style = Object.assign({}, ...style)
  }

  const flatten = Object.assign({}, ...styles, style)
  normalizeStyle(flatten)

  return omitEmptyObject(flatten)
}

type DefaultOnSelectorOptions = Pick<Options, 'state'> & {
  className: ClassNameWithSelector
}
const defaultOnSelector = ({
  className: { selector, style },
  state,
}: DefaultOnSelectorOptions) => {
  if (selector === true) {
    return style
  }
  if (state && state[selector]) {
    return style
  }
  return
}
