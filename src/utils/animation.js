import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

import { mapToMap } from '../utils/toMap';

const animationOption = {
  duration: 150,
};

export const useAnimation = (enabled, props) => {
  const r = useRef();
  if (!r.current) {
    r.current = new Animated.Value(0);
  }
  const v = r.current;
  useEffect(() => {
    Animated.timing(v, {
      ...animationOption,
      toValue: enabled ? 1 : 0,
    }).start();
    return () => Animated.timing(v).stop();
  }, [enabled, v]);
  return mapToMap(props, null, k =>
    v.interpolate({
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
