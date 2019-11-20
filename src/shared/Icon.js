import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { StyleSheet, View } from '../native/Rn';

const s = StyleSheet.create({
  Icon: {
    alignItems: `center`,
    justifyContent: `center`,
  },
});

const Icon = ({ color, path, size = 24, viewBox, ...p }) => (
  <View {...p} style={[s.Icon, p.style, !p.noFlex && { flex: 1 }]}>
    <Svg height={size} viewBox={viewBox || `0 0 24 24`} width={size}>
      <Path d={path} fill={color} />
    </Svg>
  </View>
);

export default Icon;
