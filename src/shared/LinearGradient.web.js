import React from 'react';
import { View } from 'react-native';

const LinearGradient = p => {
  const [fr, to] = p.colors;
  const style = {
    ...p.style,
    backgroundImage: `linear-gradient(${fr}, ${to})`,
  };
  return <View style={style}>{p.children}</View>;
};

export default LinearGradient;
