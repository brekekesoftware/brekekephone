import React, { forwardRef } from 'react';
import { TouchableOpacity } from 'react-native';

const RnTouchableOpacity = forwardRef((props, ref) => (
  <TouchableOpacity activeOpacity={0.8} ref={ref} {...props} />
));

export default RnTouchableOpacity;
