import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { StyleSheet, View } from '../native/Rn';

const s = StyleSheet.create({
  Icon: {
    flex: 1,
    alignItems: `center`,
    justifyContent: `center`,
  },
});

const Icon = ({ size = 24, path, color, ...p }) => (
  <View {...p} style={[s.Icon, p.style]}>
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path d={path} fill={color} />
    </Svg>
  </View>
);

export default Icon;
