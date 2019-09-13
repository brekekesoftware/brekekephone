import React, { forwardRef } from 'react';
import { StyleSheet, Text } from 'react-native';

import v from '../variables';

const s = StyleSheet.create({
  RnText: {
    position: 'relative',
    fontSize: v.fontSize,
    fontWeight: v.fontWeight,
    fontFamily: v.fontFamily,
    color: v.color,
  },
});

const RnText = forwardRef((p, ref) => (
  <Text ref={ref} {...p} style={[s.RnText, p.style]} />
));

export default RnText;
