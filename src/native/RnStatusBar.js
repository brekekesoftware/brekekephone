import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';

import v from '../variables';

const s = StyleSheet.create({
  RnStatusBar: {
    backgroundColor: v.brekekeShade0,
    borderColor: v.brekekeShade3,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        height: getStatusBarHeight(true),
      },
    }),
  },
  RnStatusBar__transparent: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
});

const RnStatusBar = p =>
  Platform.OS === 'web' ? null : (
    <View style={[s.RnStatusBar, p.transparent && s.RnStatusBar__transparent]}>
      <StatusBar backgroundColor={v.brekekeShade0} barStyle="dark-content" />
    </View>
  );

export default RnStatusBar;
