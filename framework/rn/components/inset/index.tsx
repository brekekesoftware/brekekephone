import { insetShadowClassName } from '@/rn/components/inset/inset'
import { View } from '@/rn/core/components/view'
import type { ClassName } from '@/rn/core/tw/class-name'

export type InsetShadowProps = {
  enabled?: boolean
  className?: ClassName
}

export const InsetShadow = ({ enabled, className }: InsetShadowProps) => (
  <View
    className={[
      'pointer-events-none absolute inset-[-2px] opacity-0 transition',
      enabled && 'opacity-100',
      insetShadowClassName,
      className,
    ]}
  />
)
