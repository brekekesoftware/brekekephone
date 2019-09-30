import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';

import g from '../global';
import { Animated, Dimensions, Platform, StyleSheet, View } from '../native/Rn';

const s = StyleSheet.create({
  Stack: {
    backgroundColor: g.bg,
  },
});

const Stack = ({ Component, ...p }) => {
  const [translateX] = useState(
    new Animated.Value(Dimensions.get(`screen`).width),
  );
  useEffect(() => {
    Animated.timing(translateX, {
      toValue: 0,
      duration: 150,
      useNativeDriver: Platform.OS !== `web`,
    }).start();
  }, [translateX]);
  const OuterComponent = p.isRoot ? View : Animated.View;
  return (
    <OuterComponent
      style={[
        StyleSheet.absoluteFill,
        s.Stack,
        !p.isRoot
          ? {
              transform: [
                {
                  translateX,
                },
              ],
            }
          : null,
      ]}
    >
      <Component {...p} />
    </OuterComponent>
  );
};

const RootStacks = observer(() =>
  g.stacks.map((s, i) => <Stack key={i} {...s} />),
);

export default RootStacks;
