import React from 'react';
import { View } from 'react-native';

const LinearGradient = ({ colors: [fr, to], ...p }) => (
  <View
    {...p}
    style={[
      {
        backgroundColor: fr,
        backgroundImage: `linear-gradient(${fr}, ${to})`,
      },
      p.style,
    ]}
  />
);

export default LinearGradient;
