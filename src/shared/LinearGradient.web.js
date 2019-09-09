import React from 'react';
import { View } from 'react-native';

const LinearGradient = ({ colors: [fr, to], style, children }) => {
  style = {
    ...style,
    backgroundColor: fr,
    backgroundImage: `linear-gradient(${fr}, ${to})`,
  };
  return <View style={style}>{children}</View>;
};

export default LinearGradient;
