import React, { forwardRef } from 'react';
import { TouchableOpacity } from 'react-native';

const RnTouchableOpacity = forwardRef((p, ref) => (
  <TouchableOpacity ref={ref} {...p} activeOpacity={0.8} />
));

export default RnTouchableOpacity;
