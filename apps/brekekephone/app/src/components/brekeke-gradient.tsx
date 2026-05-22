import type { FC } from 'react'
import type { LinearGradientProps } from 'react-native-linear-gradient'
import LinearGradientWocn from 'react-native-linear-gradient'

import type { ClassName } from '@/rn/core/tw/class-name'
import { createClassNameComponent } from '@/rn/core/tw/lib/create-class-name-component'
import { useRuntimeStyle } from '#/utils/rn-core-hooks'

const LinearGradient = createClassNameComponent({ LinearGradientWocn })
export type BrekekeGradientProps = Omit<LinearGradientProps, 'colors'> & {
  white?: boolean
  className?: ClassName
}
export const BrekekeGradient: FC<BrekekeGradientProps> = props => {
  const color1 = useRuntimeStyle('text-background')?.color as string
  const color2 = useRuntimeStyle('text-primary-400 dark:text-primary-700')?.color as string
  const color3 = useRuntimeStyle('text-secondary-900 dark:text-background')?.color as string
  const colors = props.white ? [color1, color1] : [color2, color3]
  return (
    <LinearGradient
      {...props}
      colors={colors}
      className={['h-full', props.className]}
    />
  )
}
