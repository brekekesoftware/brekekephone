import { debounce } from 'lodash'
import type { FC } from 'react'
import { forwardRef } from 'react'
import type { GestureResponderEvent, TouchableOpacityProps } from 'react-native'
import { TouchableOpacity } from 'react-native'

export const RnTouchableOpacity: FC<
  TouchableOpacityProps & { useDebounce?: boolean }
> = forwardRef(({ onPress, useDebounce, ...props }, ref) => {
  const onPressDebounce = debounce(
    (event: GestureResponderEvent) => onPress?.(event),
    200,
  )

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      ref={ref as (instance: unknown) => void}
      onPress={useDebounce ? onPressDebounce : onPress}
      {...props}
    />
  )
})
