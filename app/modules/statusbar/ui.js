import React from 'react';
import { Platform, StyleSheet, View, StatusBar } from 'react-native';
import { std } from '../styleguide';
import { getStatusBarHeight } from 'react-native-status-bar-height';

const st = StyleSheet.create({
  bar: {
    height: getStatusBarHeight(),
    backgroundColor: std.color.shade3,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: std.color.shade4,
  },
});

export default () => (
  <View style={st.bar}>
    <StatusBar backgroundColor={std.color.shade3} barStyle="dark-content" />
  </View>
);
