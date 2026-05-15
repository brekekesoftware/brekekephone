import type { FC } from 'react'
import { forwardRef, useEffect, useRef, useState } from 'react'
import type { GestureResponderEvent, TouchableOpacityProps } from 'react-native'
import { TouchableOpacity } from 'react-native'

import type { ClassName } from '@/rn/core/tw/class-name'
import { createClassNameComponent } from '@/rn/core/tw/lib/create-class-name-component'
import { defaultTimeout } from '#/config'

type PropsWocn = TouchableOpacityProps & {
  loading?: number | true
}
type Props = PropsWocn & {
  className?: ClassName
}

const RnTouchableOpacityWocn: FC<PropsWocn> = forwardRef(
  ({ onPress, loading, disabled, ...props }, ref) => {
    const [isLoading, setIsLoading] = useState(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const handlePress = (event: GestureResponderEvent) => {
      if (!isLoading && !disabled) {
        onPress?.(event)
        if (loading) {
          loading = typeof loading === 'number' ? loading : defaultTimeout
          setIsLoading(true)
          timeoutRef.current = setTimeout(() => setIsLoading(false), loading)
        }
      }
    }

    useEffect(
      () => () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      },
      [loading],
    )

    const d = disabled || isLoading
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        ref={ref as (instance: unknown) => void}
        onPress={handlePress}
        disabled={d}
        {...props}
      />
    )
  },
)

export const RnTouchableOpacity: FC<Props> = createClassNameComponent({
  RnTouchableOpacityWocn,
})
