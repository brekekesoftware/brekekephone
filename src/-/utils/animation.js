import useInterval from '@use-it/interval'
import { useEffect, useRef, useState } from 'react'
import { Animated } from 'react-native'

import { mapToMap } from '../utils/toMap'

export const animationOption = {
  duration: 150,
}

export const useAnimation = (enabled, props, options) => {
  const r = useRef()
  if (!r.current) {
    r.current = new Animated.Value(0)
  }
  const v = r.current
  useEffect(() => {
    Animated.timing(v, {
      ...animationOption,
      ...options,
      toValue: enabled ? 1 : 0,
    }).start()
    return () => Animated.timing(v).stop()
  }, [enabled, options, v])
  return mapToMap(props, null, k =>
    v.interpolate({
      inputRange: [0, 1],
      outputRange: props[k],
    }),
  )
}

export const useAnimationOnDidMount = props => {
  const [didMount, setDidMount] = useState(false)
  useEffect(() => setDidMount(true), [])
  return useAnimation(didMount, props)
}

export const useAnimationInterval = (props, duration = 300) => {
  const [isStart, setIsStart] = useState(true)
  useInterval(() => setIsStart(i => !i), duration)
  return useAnimation(isStart, props, { duration })
}
