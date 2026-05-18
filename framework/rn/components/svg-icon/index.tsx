import type { ComponentType } from 'react'
import { createElement } from 'react'
import type { SvgProps } from 'react-native-svg'

import { useSvgIconProps } from '@/rn/components/svg-icon/use-svg-icon-props'
import type { ClassName } from '@/rn/core/tw/class-name'

export type SvgIconProps = SvgProps & {
  size?: number
  className?: ClassName
}

// nextjs ssr does not accept non serializeable props such as Svg={SvgComponent}
// we should define a component for each individual icon using this hook instead
export const createSvgIcon =
  (Svg: ComponentType<any>) => async (props: SvgIconProps) =>
    createElement(Svg, useSvgIconProps(props))
