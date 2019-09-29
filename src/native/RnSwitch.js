import React from 'react';
import { StyleSheet, View } from 'react-native';

import v from '../variables';

const s = StyleSheet.create({
  RnSwitch: {
    height: 12,
    width: 32,
    backgroundColor: v.fn.darken(0.05, v.hoverBg),
    borderRadius: 12,
  },
  RnSwitch__enabled: {
    backgroundColor: v.mainBg,
  },
  RnSwitch_Circle: {
    position: `absolute`,
    top: -3,
    left: -1,
    width: 18,
    height: 18,
    borderRadius: 18,
    backgroundColor: v.fn.darken(0.05, v.borderBg),
    ...v.boxShadow,
  },
  RnSwitch_Circle__enabled: {
    left: null,
    right: -1,
    backgroundColor: v.mainDarkBg,
  },
});

const RnSwitch = ({ enabled, style, ...p }) => (
  <View {...p} style={[s.RnSwitch, enabled && s.RnSwitch__enabled, style]}>
    <View style={[s.RnSwitch_Circle, enabled && s.RnSwitch_Circle__enabled]} />
  </View>
);

export default RnSwitch;
