import type { ClassName } from '@rntwsc/rn/core/tw/class-name'
import { clsx } from '@rntwsc/rn/core/tw/clsx'
import { createClassNameComponent } from '@rntwsc/rn/core/tw/lib/create-class-name-component'
import { isWeb } from '@rntwsc/rn/core/utils/platform'
import type { FC } from 'react'
import { forwardRef, useEffect, useRef, useState } from 'react'
import type { GestureResponderEvent, TouchableOpacityProps } from 'react-native'
import { TouchableOpacity } from 'react-native'

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

    if (isWeb) {
      // @ts-ignore
      props.className = clsx('cursor-pointer', props.className)
    }

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
