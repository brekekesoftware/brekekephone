import type { ViewProps } from '@/rn/core/components/view'
import { View } from '@/rn/core/components/view'

export type SkeletonProps = Omit<ViewProps, 'children'>

export const Skeleton = ({ className, ...props }: SkeletonProps) => (
  <View
    {...props}
    className={['w-full animate-pulse rounded-md bg-gray-500', className]}
  />
)
