import React, { forwardRef } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';

const RnTouchableOpacityWeb = forwardRef(({ focusable, ...props }, ref) => {
  const Comp = focusable ? TouchableOpacity : View;
  void Comp; // TODO
  return (
    <TouchableOpacity
      ref={ref}
      activeOpacity={0.8}
      {...props}
      onClick={props.onPress}
    />
  );
});
const RnTouchableOpacity = forwardRef((props, ref) => (
  <TouchableOpacity ref={ref} activeOpacity={0.8} {...props} />
));

export default Platform.OS === `web`
  ? RnTouchableOpacityWeb
  : RnTouchableOpacity;
