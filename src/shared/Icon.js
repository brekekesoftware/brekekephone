import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { StyleSheet, View } from '../native/Rn';
import v from '../variables';

const css = StyleSheet.create({
  Icon: {
    alignItems: `center`,
    justifyContent: `center`,
  },
});

const Icon = ({ color, path, size = v.iconSize, viewBox, ...p }) => (
  <View {...p} style={[css.Icon, p.style, !p.noFlex && { flex: 1 }]}>
    <Svg
      height={size}
      /* 24 is the regular size of the @mdi/js package */
      viewBox={viewBox || `0 0 24 24`}
      width={size}
    >
      <Path d={path} fill={color} />
    </Svg>
  </View>
);

export default Icon;
