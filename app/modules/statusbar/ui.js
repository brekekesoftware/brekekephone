import React from 'react';
import { Platform, StyleSheet, View, StatusBar } from 'react-native';
import { std } from '../styleguide';

const st = StyleSheet.create({
  bar: Platform.select({
    ios: {
      height: 20,
      backgroundColor: std.color.shade3,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: std.color.shade4,
    },
    android: {
      backgroundColor: std.color.shade3,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: std.color.shade4,
    },
  }),
});

export default () => (
  <View style={st.bar}>
    <StatusBar backgroundColor={std.color.shade3} barStyle="dark-content" />
  </View>
);
