import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

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
    colors={props.colors}
  />
);

export default BrekekeGradient;
