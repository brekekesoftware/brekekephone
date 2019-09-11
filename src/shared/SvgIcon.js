import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const s = StyleSheet.create({
  SvgIcon: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const SvgIcon = ({ size = 24, path, color, ...p }) => (
  <View {...p} style={[s.SvgIcon, p.style]}>
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path d={path} fill={color} />
    </Svg>
  </View>
);

export default SvgIcon;
