import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

import { mapToMap } from '../utils/toMap';

const animationOption = {
  duration: 150,
};
export const setAnimationOption = opt => {
  Object.assign(animationOption, opt);
};

export const useAnimation = (enabled, props) => {
  const r = useRef();
  if (!r.current) {
    r.current = new Animated.Value(0);
  }
  useEffect(() => {
    Animated.timing(r.current, {
      ...animationOption,
      toValue: enabled ? 1 : 0,
    }).start();
    return () => Animated.timing(r.current).stop();
  }, [enabled]);
  return mapToMap(props, null, k =>
    r.current.interpolate({
      inputRange: [0, 1],
      outputRange: props[k],
    }),
  );
};

export const useAnimationOnDidMount = props => {
  const [didMount, setDidMount] = useState(false);
  useEffect(() => setDidMount(true), []);
  return useAnimation(didMount, props);
};
