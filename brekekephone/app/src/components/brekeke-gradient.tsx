import type { ClassName } from '@rntwsc/rn/core/tw/class-name'
import type { FC } from 'react'
import type { LinearGradientProps } from 'react-native-linear-gradient'

import { RnLinearGradient } from '#/components/rn-class-name-components'
import { useRuntimeStyle } from '#/utils/rn-core-hooks'

export type BrekekeGradientProps = Omit<LinearGradientProps, 'colors'> & {
  white?: boolean
  className?: ClassName
}
export const BrekekeGradient: FC<BrekekeGradientProps> = props => {
  const color1 = useRuntimeStyle('text-background')?.color as string
  const color2 = useRuntimeStyle('text-primary-400 dark:text-primary-700')
    ?.color as string
  const color3 = useRuntimeStyle('text-secondary-900 dark:text-background')
    ?.color as string
  const colors = props.white ? [color1, color1] : [color2, color3]
  return (
    <RnLinearGradient
      {...props}
      colors={colors}
      className={['h-full', props.className]}
    />
  )
}
