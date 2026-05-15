'use client'

import type { ReactElement } from 'react'
import { Children, cloneElement } from 'react'

import type { ButtonProps } from '@/rn/components/button'
import { View } from '@/rn/core/components/view'
import { tw } from '@/rn/core/tw/tw'

export type ButtonGroupProps = Pick<
  ButtonProps,
  | 'type'
  | 'appearance'
  | 'size'
  | 'shape'
  | 'inset'
  | 'ripple'
  | 'disabled'
  | 'className'
  | 'children'
>

export const ButtonGroup = ({
  type = 'primary',
  appearance = 'solid',
  size = 'md',
  shape = 'rounded',
  inset = true,
  ripple = true,
  disabled,
  className,
  children,
}: ButtonGroupProps) => {
  const arr = Children.toArray(children)
  const count = arr.length

  children = arr.map((_c, i) => {
    const c = _c as ReactElement<ButtonProps>
    const isOutline = appearance === 'outline'
    const isOnlyChild = count === 1
    const isFirst = i === 0
    const isLast = i === count - 1
    const isMiddle = !isFirst && !isLast

    return cloneElement(c, {
      type: c.props.type || type,
      appearance,
      size,
      shape: isOnlyChild || isMiddle ? 'none' : shape,
      groupFirst: !isOnlyChild && isFirst,
      groupLast: !isOnlyChild && isLast,
      elevation: false,
      inset,
      ripple,
      disabled: c.props.disabled || disabled,
      className: [isOutline && !isFirst && tw`ml-[-1px]`, c.props.className],
    })
  })

  return <View className={['flex-row', className]}>{children}</View>
}
