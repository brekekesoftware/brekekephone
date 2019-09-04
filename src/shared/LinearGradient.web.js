import React from 'react';
import { View } from 'react-native';

const LinearGradient = ({ colors: [fr, to], style, children }) => (
  <View
    style={{
      ...style,
      backgroundImage: `linear-gradient(${fr}, ${to})`,
    }}
  >
    {children}
  </View>
);

export default LinearGradient;
