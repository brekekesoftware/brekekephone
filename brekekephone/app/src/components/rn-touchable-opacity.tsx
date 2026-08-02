import type { FC } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { GestureResponderEvent, TouchableOpacityProps } from 'react-native'
import { TouchableOpacity } from 'react-native'
import { isWeb } from 'rntwsc/platform'
import type { ClassName } from 'rntwsc/tw/class-name'
import { clsx } from 'rntwsc/tw/clsx'
import { createClassNameComponent } from 'rntwsc/tw/lib/create-class-name-component'

import { defaultTimeout } from '@/config'

type PropsWocn = TouchableOpacityProps & {
  loading?: number | true
  ref?: any
}
type Props = PropsWocn & {
  className?: ClassName
}

const RnTouchableOpacityWocn: FC<PropsWocn> = ({
  ref,
  onPress,
  loading,
  disabled,
  ...props
}) => {
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
}

export const RnTouchableOpacity: FC<Props> = createClassNameComponent({
  RnTouchableOpacityWocn,
})
