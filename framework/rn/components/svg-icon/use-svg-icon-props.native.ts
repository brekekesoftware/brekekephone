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
    style as ClassName,
  ])
  const width = size || styleComposed?.fontSize || 24
  const height = size || styleComposed?.lineHeight || width

  return {
    ...props,
    style: styleComposed,
    width,
    height,
  }
}
