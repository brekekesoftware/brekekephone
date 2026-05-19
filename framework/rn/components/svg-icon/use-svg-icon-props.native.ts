import type { SvgIconProps } from '@/rn/components/svg-icon'
import { useTextStyle } from '@/rn/components/text/text-style-context'
import type { ClassName } from '@/rn/core/tw/class-name'
import { useRuntimeStyle } from '@/rn/core/utils/use-runtime-style.native'

export const useSvgIconProps = async ({
  size,
  className,
  style,
  ...props
}: SvgIconProps) => {
  const ctx = useTextStyle()
  const styleComposed = await useRuntimeStyle([
    ctx,
    className,
    style,
  ] as ClassName)
  size = size || styleComposed?.fontSize || 24
  const lineHeight = styleComposed?.lineHeight || size

  return {
    ...props,
    width: size,
    height: lineHeight,
    style: styleComposed,
  }
}
