import React from 'react';
import Svg, { Path } from 'react-native-svg';

// Similar to
// https://github.com/Templarian/MaterialDesign-React
const SvgIcon = ({ path, color, ...style }) => {
  style.width = style.width || 24;
  style.height = style.height || 24;
  return (
    <Svg viewBox="0 0 24 24" style={style}>
      <Path d={path} fill={color} />
    </Svg>
  );
};

export default SvgIcon;
