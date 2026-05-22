import type { FC } from 'react'
import type { LinearGradientProps } from 'react-native-linear-gradient'
import LinearGradientWocn from 'react-native-linear-gradient'

import type { ClassName } from '@/rn/core/tw/class-name'
import { createClassNameComponent } from '@/rn/core/tw/lib/create-class-name-component'
import { variables as defaultVariables } from '#/theme/brekeke-scss'
import { useDarkModeState, useThemeVariables } from '#/utils/rn-core-hooks'

const LinearGradient = createClassNameComponent({ LinearGradientWocn })
export type BrekekeGradientProps = Omit<LinearGradientProps, 'colors'> & {
  white?: boolean
  className?: ClassName
}
export const BrekekeGradient: FC<BrekekeGradientProps> = props => {
  const dark = useDarkModeState()
  const variables = useThemeVariables() || defaultVariables
  const colors = props.white
    ? [variables['--background'], variables['--background']]
    : [
        dark?.dark ? variables['--primary-700'] : variables['--primary-400'],
        dark?.dark ? variables['--background'] : variables['--secondary-900'],
      ]
  return (
    <LinearGradient
      {...props}
      colors={colors}
      className={['h-full', props.className]}
    />
  )
}
