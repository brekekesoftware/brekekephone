import React from 'react';
import { StyleSheet, View } from 'react-native';
import { std } from '../styleguide';

const st = StyleSheet.create({
  main: {
    position: 'absolute',
    top: std.textSize.md + std.gap.md * 4, // topbar height
    left: 0,
    bottom: 0,
  },
});

const Notifications = ({ children }) => (
  <View style={st.main} pointerEvents="box-none">
    {children}
  </View>
);

export default Notifications;
