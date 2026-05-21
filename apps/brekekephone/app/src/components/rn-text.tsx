import type { FC } from 'react'
import { forwardRef } from 'react'

import { Text } from '@/rn/components/text'
import type { TextProps } from '@/rn/core/components/text'
import type { ClassName } from '@/rn/core/tw/class-name'
import { clsx } from '@/rn/core/tw/clsx'
import { tw } from '@/rn/core/tw/tw'
import { pickBy } from '@/shared/lodash'

const classMap: { [k: string]: string } = {
  title: 'text-[25.2px] leading-9 font-bold',
  subTitle: 'text-[16.8px] leading-6 font-bold',
  small: 'text-[11.2px] leading-4 font-bold',
  black: 'text-black',
  white: 'text-white',
  primary: 'text-primary',
  warning: 'text-warning',
  danger: 'text-error',
  normal: 'font-normal',
  bold: 'font-bold',
  center: 'text-center',
  right: 'text-right',
  padding: 'px-2.5',
}

const baseClass = tw`leading-5 text-foreground`

const wrap = (Component: any) =>
  forwardRef(
    (
      {
        singleLine,
        className: callerClassName,
        ...props
      }: TextProps & {
        singleLine: boolean
        className?: ClassName
      },
      ref,
    ) => {
      const variantClasses = Object.keys(props)
        .sort(k =>
          k === 'title' || k === 'subTitle' || k === 'small' ? -1 : 1,
        )
        .map(
          k =>
            (props as any)[k] && classMap[k as keyof typeof classMap],
        )
        .filter(Boolean)
        .join(' ')
      const cn = clsx(baseClass, variantClasses, callerClassName)
      return (
        <Component
          numberOfLines={singleLine ? 1 : 999}
          ref={ref}
          {...pickBy(props, (_, k) => !(k in classMap))}
          className={cn}
        />
      )
    },
  )

type TextVariantProps = Partial<{
  singleLine: boolean
  title: boolean
  subTitle: boolean
  small: boolean
  black: boolean
  white: boolean
  primary: boolean
  warning: boolean
  danger: boolean
  normal: boolean
  bold: boolean
  center: boolean
  right: boolean
  padding: boolean
}>

export type TRnTextProps = Omit<TextProps, 'style'> & TextVariantProps
export type TRnText = FC<TRnTextProps>

export const RnText = wrap(Text) as TRnText
