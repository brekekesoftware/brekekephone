import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

import g from '../global';
import { StyleSheet } from '../native/Rn';

const s = StyleSheet.create({
  BrekekeGradient: {
    height: `100%`,
    minHeight: 550,
  },
});

const BrekekeGradient = props => (
  <LinearGradient
    {...props}
    style={[s.BrekekeGradient, props.style]}
    colors={[g.mainBg, g.revBg]}
  />
);

export default BrekekeGradient;
