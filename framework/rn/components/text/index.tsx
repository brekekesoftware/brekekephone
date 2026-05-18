'use client'

import { useTextStyle } from '@/rn/components/text/text-style-context'
import type { TextProps } from '@/rn/core/components/text'
import { TextWithoutContext } from '@/rn/core/components/text'

export const Text = ({ className, ...props }: TextProps) => {
  const ctx = useTextStyle()
  return <TextWithoutContext {...props} className={[ctx, className]} />
}

export const H1 = ({ className, ...props }: TextProps) => (
  <Text
    {...props}
    accessibilityRole='header'
    aria-level='1'
    className={['text-4xl font-medium', className]}
  />
)
export const H2 = ({ className, ...props }: TextProps) => (
  <Text
    {...props}
    accessibilityRole='header'
    aria-level='2'
    className={['text-3xl font-medium', className]}
  />
)
export const H3 = ({ className, ...props }: TextProps) => (
  <Text
    {...props}
    accessibilityRole='header'
    aria-level='3'
    className={['text-2xl font-medium', className]}
  />
)
export const H4 = ({ className, ...props }: TextProps) => (
  <Text
    {...props}
    accessibilityRole='header'
    aria-level='4'
    className={['text-xl font-medium', className]}
  />
)
export const H5 = ({ className, ...props }: TextProps) => (
  <Text
    {...props}
    accessibilityRole='header'
    aria-level='5'
    className={['text-lg font-medium', className]}
  />
)
export const H6 = ({ className, ...props }: TextProps) => (
  <Text
    {...props}
    accessibilityRole='header'
    aria-level='6'
    className={['text-base font-medium', className]}
  />
)

export const Span = (props: TextProps) => <Text {...props} rnwTag='span' />
