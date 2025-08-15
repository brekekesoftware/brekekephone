import { debounce } from 'lodash'
import type { FC } from 'react'
import { forwardRef, useCallback, useEffect } from 'react'
import type { GestureResponderEvent, TouchableOpacityProps } from 'react-native'
import { TouchableOpacity } from 'react-native'

export const DEFAULT_MS_DELAY = 300

export const RnTouchableOpacity: FC<
  TouchableOpacityProps & { msDelay?: number }
> = forwardRef(({ onPress, msDelay, ...props }, ref) => {
  const onPressDebounce = useCallback(
    debounce((event: GestureResponderEvent) => onPress?.(event), msDelay),
    [onPress],
  )

  useEffect(
    () => () => {
      // Cancel debounce when unmount
      msDelay && onPressDebounce.cancel()
    },
    [onPressDebounce],
  )

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      ref={ref as (instance: unknown) => void}
      onPress={msDelay ? onPressDebounce : onPress}
      {...props}
    />
  )
})
