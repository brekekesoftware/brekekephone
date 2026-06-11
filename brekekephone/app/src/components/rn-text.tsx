import { Text } from '@rntwsc/rn/components/text'
import type { TextProps } from '@rntwsc/rn/core/components/text'
import type { ClassName } from '@rntwsc/rn/core/tw/class-name'
import { clsx } from '@rntwsc/rn/core/tw/clsx'
import { tw } from '@rntwsc/rn/core/tw/tw'
import { pickBy } from '@rntwsc/shared/lodash'
import type { FC } from 'react'
import { forwardRef } from 'react'

const classMap = {
  title: tw`text-[25.2px] leading-9 font-bold`,
  subTitle: tw`text-[16.8px] leading-6 font-bold`,
  small: tw`text-[11.2px] leading-4 font-bold`,
  black: tw`text-black`,
  white: tw`text-white`,
  primary: tw`text-primary`,
  warning: tw`text-warning`,
  danger: tw`text-error`,
  normal: tw`font-normal`,
  bold: tw`font-bold`,
  center: tw`text-center`,
  right: tw`text-right`,
  padding: tw`px-2.5`,
}

const baseClass = tw`text-foreground leading-5`

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
        .map(k => (props as any)[k] && classMap[k as keyof typeof classMap])
        .filter(Boolean)
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
