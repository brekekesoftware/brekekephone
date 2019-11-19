import React, { forwardRef } from 'react';
import { Platform, StyleSheet, TextInput } from 'react-native';

import v from '../variables';

const s = StyleSheet.create({
  RnTextInput: {
    position: `relative`,
    fontSize: v.fontSize,
    fontWeight: v.fontWeight,
    fontFamily: v.fontFamily,
    color: v.color,
  },
});

const RnTextInput = forwardRef((props, ref) => (
  <TextInput
    autoCapitalize="none"
    ref={ref}
    {...props}
    keyboardType={Platform.OS === `web` ? null : props.keyboardType}
    style={[s.RnTextInput, props.style]}
  />
));

export default RnTextInput;
