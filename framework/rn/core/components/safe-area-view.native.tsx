import type { ViewProps } from '@/rn/core/components/view'
import { View } from '@/rn/core/components/view'
import { useSafeAreaPadding } from '@/rn/core/responsive/use-safe-area'

export const SafeAreaView = ({ className, ...props }: ViewProps) => {
  const padding = useSafeAreaPadding()
  return <View {...props} className={[padding, className]} />
}
