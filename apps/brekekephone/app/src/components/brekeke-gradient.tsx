import type { FC } from 'react'
import type { LinearGradientProps } from 'react-native-linear-gradient'
import LinearGradientWocn from 'react-native-linear-gradient'

import type { ClassName } from '@/rn/core/tw/class-name'
import { createClassNameComponent } from '@/rn/core/tw/lib/create-class-name-component'
import { v } from '#/components/variables'
import { useDarkModeState } from '#/utils/rn-core-hooks'

const LinearGradient = createClassNameComponent({ LinearGradientWocn })
export type BrekekeGradientProps = Omit<LinearGradientProps, 'colors'> & {
  white?: boolean
  className?: ClassName
}
export const BrekekeGradient: FC<BrekekeGradientProps> = props => {
  const dark = useDarkModeState()
  return (
    <LinearGradient
      {...props}
      colors={
        props.white
          ? ['white', 'white']
          : [v.colors.primaryFn((dark?.dark ? -1 : 1) * 0.2), v.revBg]
      }
      className={['h-full', props.className]}
    />
  )
}
