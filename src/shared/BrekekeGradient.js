import React from 'react';
import { StyleSheet } from 'react-native';

import LinearGradient from '../native/LinearGradient';
import v from '../variables';

const s = StyleSheet.create({
  BrekekeGradient: {
    display: 'flex',
    height: '100%',
    minHeight: 550,
  },
});

const BrekekeGradient = p => (
  <LinearGradient
    {...p}
    style={[s.BrekekeGradient, p.style]}
    colors={[v.brekekeGreen, '#2a2a2a']}
  />
);

export default BrekekeGradient;
