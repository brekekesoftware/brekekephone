import React, { forwardRef } from 'react';
import { Platform, StyleSheet, TextInput } from 'react-native';

import v from '../variables';

const css = StyleSheet.create({
  RnTextInput: {
    position: 'relative',
    fontSize: v.fontSize,
    fontWeight: v.fontWeight,
    fontFamily: v.fontFamily,
    color: v.color,
  },
});

const RnTextInput = forwardRef(({ keyboardType, style, ...props }, ref) => (
  <TextInput
    autoCapitalize="none"
    ref={ref}
    {...props}
    keyboardType={Platform.OS === 'web' ? null : keyboardType}
    style={[css.RnTextInput, style]}
  />
));

export default RnTextInput;
