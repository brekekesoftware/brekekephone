import React from 'react';

import LinearGradient from '../native/LinearGradient';
import { StyleSheet } from '../native/Rn';
import v from '../variables';

const s = StyleSheet.create({
  BrekekeGradient: {
    height: '100%',
    minHeight: 550,
  },
});

const BrekekeGradient = p => (
  <LinearGradient
    {...p}
    style={[s.BrekekeGradient, p.style]}
    colors={[v.mainBg, v.revBg]}
  />
);

export default BrekekeGradient;
