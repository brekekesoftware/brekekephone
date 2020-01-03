import React, { useState } from 'react';

import { Animated, StyleSheet, View } from '../native/Rn';
import { useAnimationOnDidMount } from '../utils/animation';

const css = StyleSheet.create({
  Getter: {
    opacity: 0,
  },
  GetterInner: {
    position: `absolute`,
  },
  Inner: {
    flex: 1,
    overflow: `hidden`,
  },
});

// The style and innerStyle prop should only be used for positioning and theming
// We should not use them for sizing like height/border/padding... -> use the children instead
const AnimatedHeight = p => {
  const [height, setHeight] = useState(0);
  const Component = height ? Animation : Getter;
  return <Component {...p} height={height} setHeight={setHeight} />;
};

const Getter = ({ children, setHeight }) => (
  <View style={css.Getter}>
    <View
      onLayout={e => setHeight(e.nativeEvent.layout.height)}
      style={css.GetterInner}
    >
      {children}
    </View>
  </View>
);
const Animation = ({ children, height, innerStyle, style }) => {
  const cssAnimation = useAnimationOnDidMount({
    height: [0, height],
  });
  return (
    <Animated.View style={[style, cssAnimation]}>
      <View style={[css.Inner, innerStyle]}>{children}</View>
    </Animated.View>
  );
};

export default AnimatedHeight;
