import type { ViewProps } from '@/rn/core/components/view'
import { View } from '@/rn/core/components/view'

export type SpinnerProps = Omit<ViewProps, 'children'>

export const Spinner = ({ className, ...props }: SpinnerProps) => (
  <View
    {...props}
    className={[
      'h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent',
      className,
    ]}
  />
)
