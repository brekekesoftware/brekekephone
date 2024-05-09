import { useEffect, useRef, useState } from 'react'
import { Animated } from 'react-native'

import { arrToMap } from './arrToMap'

export const animationOption = {
  duration: 150,
}

type AnimationProps = {
  [k: string]: any // []
}

export const useAnimation = <T extends AnimationProps>(
  enabled: boolean,
  props: T,
  options?: Animated.TimingAnimationConfig,
) => {
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
      useNativeDriver: false,
    })
    t.start()
    return () => t.stop()
  }, [enabled, options, v])
  return arrToMap(
    Object.keys(props),
    k => k,
    k =>
      v.interpolate({
        inputRange: [0, 1],
        outputRange: props[k],
      }),
  ) as {
    [k in keyof T]: T[k][0]
  }
}

export const useAnimationOnDidMount = <T extends AnimationProps>(props: T) => {
  const [didMount, setDidMount] = useState(false)
  useEffect(() => setDidMount(true), [])
  return useAnimation(didMount, props)
}
