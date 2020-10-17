import { useEffect, useRef, useState } from 'react'
import { Animated } from 'react-native'

import { mapToMap } from './toMap'

export const animationOption = {
  duration: 150,
}

export function useAnimation<T extends object>(
  enabled: boolean,
  props: T,
  options?: Animated.TimingAnimationConfig,
) {
  const r = useRef<Animated.Value>()
  if (!r.current) {
    r.current = new Animated.Value(0)
  }
  const v = r.current
  useEffect(() => {
    const t = Animated.timing(v, {
      ...animationOption,
      ...options,
      toValue: enabled ? 1 : 0,
    })
    t.start()
    return () => t.stop()
  }, [enabled, options, v])
  return mapToMap(props, undefined, k =>
    v.interpolate({
      inputRange: [0, 1],
      outputRange: props[k],
    }),
  ) as T
}

export function useAnimationOnDidMount<T extends object>(props: T) {
  const [didMount, setDidMount] = useState(false)
  useEffect(() => setDidMount(true), [])
  return useAnimation(didMount, props)
}
