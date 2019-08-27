import React from 'react';
import Svg, { Path } from 'react-native-svg';

// Similar to
// https://github.com/Templarian/MaterialDesign-React
const SvgIcon = p => (
  <Svg
    viewBox="0 0 24 24"
    style={{
      width: p.width || 24,
      height: p.height || 24,
      backgroundColor: p.bgcolor,
    }}
  >
    <Path d={p.path} fill={p.color} />
  </Svg>
);

export default SvgIcon;
