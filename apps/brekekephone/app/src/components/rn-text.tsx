import type { FC } from 'react'
import { forwardRef } from 'react'
import { Animated, StyleSheet, Text } from 'react-native'

import type { TextProps } from '@/rn/core/components/text'
import { createClassNameComponent } from '@/rn/core/tw/lib/create-class-name-component'
import { pickBy } from '@/shared/lodash'
import { v } from '#/components/variables'

const css = StyleSheet.create({
  RnText: {
    position: 'relative',
    fontSize: v.fontSize,
    lineHeight: v.lineHeight,
    fontWeight: v.fontWeight,
    fontFamily: v.fontFamily,
    color: v.color,
  },
  title: {
    fontSize: v.fontSizeTitle,
    lineHeight: v.lineHeightTitle,
    fontWeight: 'bold',
  },
  subTitle: {
    fontSize: v.fontSizeSubTitle,
    lineHeight: v.lineHeightSubTitle,
    fontWeight: 'bold',
  },
  small: {
    fontSize: v.fontSizeSmall,
    lineHeight: v.lineHeightSmall,
    fontWeight: 'bold',
  },
  black: {
    color: 'black',
  },
  white: {
    color: 'white',
  },
  primary: {
    color: v.colors.primary,
  },
  warning: {
    color: v.colors.warning,
  },
  danger: {
    color: v.colors.danger,
  },
  normal: {
    fontWeight: 'normal',
  },
  bold: {
    fontWeight: 'bold',
  },
  center: {
    textAlign: 'center',
  },
  right: {
    textAlign: 'right',
  },
  padding: {
    paddingHorizontal: 10,
  },
})

const wrap = (Component: any) =>
  forwardRef(
    (
      {
        singleLine,
        style,
        ...props
      }: TextProps & {
        singleLine: boolean
      },
      ref,
    ) => (
      <Component
        numberOfLines={singleLine ? 1 : 999}
        ref={ref}
        {...pickBy(props, (p, k) => !(k in css))}
        style={[
          css.RnText,
          ...Object.keys(props)
            .sort(k =>
              k === 'title' || k === 'subTitle' || k === 'small' ? -1 : 1,
            )
            .map(
              k => props[k as keyof typeof props] && css[k as keyof typeof css],
            ),
          style,
        ]}
      />
    ),
  )

export type TRnTextProps = TextProps &
  Partial<{
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
export type TRnText = FC<TRnTextProps>

export const RnText = createClassNameComponent({
  TextWocn: wrap(Text),
}) as TRnText

export const AnimatedText = createClassNameComponent({
  AnimatedTextWocn: wrap(Animated.Text),
}) as TRnText
