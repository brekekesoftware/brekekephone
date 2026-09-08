import type { FC } from 'react'
import { forwardRef, useEffect, useRef, useState } from 'react'
import type { GestureResponderEvent, TouchableOpacityProps } from 'react-native'
import { TouchableOpacity } from 'react-native'

import { defaultTimeout } from '#/config'

export const RnTouchableOpacity: FC<
  TouchableOpacityProps & { loading?: number | true }
> = forwardRef(({ onPress, loading, disabled, ...props }, ref) => {
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
})
