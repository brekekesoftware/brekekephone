import React, { forwardRef } from 'react';
import { TouchableOpacity } from 'react-native';

const RnTouchableOpacity = forwardRef((props, ref) => (
  <TouchableOpacity ref={ref} activeOpacity={0.8} {...props} />
));

export default RnTouchableOpacity;
