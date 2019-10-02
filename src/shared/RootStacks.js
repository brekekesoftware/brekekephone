import { observer } from 'mobx-react';
import React from 'react';

import g from '../global';
import { Animated, Dimensions, StyleSheet, View } from '../native/Rn';
import { useAnimationOnDidMount } from '../utils/animation';

const s = StyleSheet.create({
  Stack: {
    backgroundColor: g.bg,
  },
});

const Stack = ({ Component, ...p }) => {
  const a = useAnimationOnDidMount({
    translateX: [Dimensions.get(`screen`).width, 0],
  });
  const OuterComponent = p.isRoot ? View : Animated.View;
  return (
    <OuterComponent
      style={[
        StyleSheet.absoluteFill,
        s.Stack,
        !p.isRoot && {
          transform: [{ translateX: a.translateX }],
        },
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
