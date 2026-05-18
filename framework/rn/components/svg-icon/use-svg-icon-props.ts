import type { SvgIconProps } from '@/rn/components/svg-icon'
import { useTextStyle } from '@/rn/components/text/text-style-context'
import type { ClassName } from '@/rn/core/tw/class-name'
import { clsx } from '@/rn/core/tw/clsx'
import { runtimeStyle } from '@/rn/core/tw/runtime-style'

export const useSvgIconProps = ({
  size,
  className,
  style,
  ...props
}: SvgIconProps) => {
  const ctx = useTextStyle()
  className = clsx(ctx, className)
  const styleComposed = runtimeStyle([className, style] as ClassName)
  size = size || styleComposed?.fontSize || 24
  const lineHeight = styleComposed?.lineHeight || size

  return {
    ...props,
    className,
    width: size,
    height: lineHeight,
  }
}
