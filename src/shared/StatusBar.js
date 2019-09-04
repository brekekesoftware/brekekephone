import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';

import v from '../style/variables';

const s = StyleSheet.create({
  MyStatusBar: {
    backgroundColor: v.brekekeShade3,
    borderColor: v.brekekeShade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: {
        height: getStatusBarHeight(true),
      },
      web: {
        borderBottomWidth: 0,
      },
    }),
  },
});

const MyStatusBar = () => (
  <View style={s.MyStatusBar}>
    <StatusBar backgroundColor={v.brekekeShade3} barStyle="dark-content" />
  </View>
);

export default MyStatusBar;
