import type { ViewProps } from '@/rn/core/components/view'
import { View } from '@/rn/core/components/view'

export type SeparatorProps = Omit<ViewProps, 'children'>

export const Separator = ({ className, ...props }: SeparatorProps) => (
  <View
    {...props}
    aria-hidden
    className={['my-2 h-px w-full bg-gray-200', className]}
  />
)
