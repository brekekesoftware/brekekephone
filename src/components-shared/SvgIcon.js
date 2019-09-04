import React from 'react';
import Svg, { Path } from 'react-native-svg';

// Similar to
// https://github.com/Templarian/MaterialDesign-React
const SvgIcon = ({ path, color, style, ...rest }) => {
  rest.width = rest.width || 24;
  rest.height = rest.height || 24;
  return (
    <Svg viewBox="0 0 24 24" style={[style, rest]}>
      <Path d={path} fill={color} />
    </Svg>
  );
};

export default SvgIcon;
