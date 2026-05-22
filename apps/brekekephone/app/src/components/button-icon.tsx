import type { FC } from 'react'
import { useState } from 'react'
import Svg, { Path } from 'react-native-svg'

import { View } from '@/rn/core/components/view'
import type { ClassName } from '@/rn/core/tw/class-name'
import { RnText, RnTouchableOpacity } from '#/components/rn'
import { RnActivityIndicator } from '#/components/rn-activity-indicator'
import { BackgroundTimer } from '#/utils/background-timer'
import { useRuntimeStyle } from '#/utils/rn-core-hooks'

export const ButtonIcon: FC<{
  path: string
  size?: number
  disabled?: boolean
  onPress?(): void
  // Controls button bg + border + icon fill. Icon fill is derived from
  // text-* class via useRuntimeStyle (same pattern as rn-icon.tsx).
  className?: ClassName
  noborder?: boolean
  name?: string
  containerClassName?: ClassName
  msLoading?: number
  loading?: boolean
}> = p => {
  const [isLoading, setLoading] = useState(false)
  const onBtnPress = () => {
    if (p.msLoading) {
      setLoading(true)
      BackgroundTimer.setTimeout(() => {
        // TODO: possible react warning memory leak set state after unmount
        setLoading(false)
      }, p.msLoading)
    }
    p.onPress?.()
  }
  const size = p.size || 15
  const spinnerSizeCls = `w-[${size}px] h-[${size}px]`
  // Resolve icon fill from className text-* class - theme-aware via variables.
  const style = useRuntimeStyle(['text-foreground', p.className])
  const iconFill = style?.color as string
  return (
    <View className={['mx-1.25 items-center', p.containerClassName]}>
      <RnTouchableOpacity
        disabled={isLoading || p.loading || p.disabled}
        onPress={onBtnPress}
        className={[
          'rounded-full border p-3',
          p.noborder && 'border-0',
          p.className,
          // Disabled appended LAST so it overrides caller bg.
          p.disabled && 'bg-foreground-disabled',
        ]}
      >
        {isLoading || p.loading ? (
          <RnActivityIndicator className={spinnerSizeCls} />
        ) : (
          <Svg height={size} viewBox='0 0 24 24' width={size}>
            <Path d={p.path} fill={iconFill} />
          </Svg>
        )}
      </RnTouchableOpacity>
      {p.name && (
        <RnText small center white className='ios:min-w-17.5 min-w-20 pt-1.25'>
          {p.name}
        </RnText>
      )}
    </View>
  )
}
