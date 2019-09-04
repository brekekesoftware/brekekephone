import { View } from 'native-base';
import React from 'react';
import { Platform, StatusBar, StyleSheet } from 'react-native';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';

import registerStyle from '../style/registerStyle';
import v from '../style/variables';

registerStyle(v => ({
  View: {
    MyStatusBar: {
      backgroundColor: v.brekekeShade3,
      borderColor: v.brekekeShade4,
      borderBottomWidth: StyleSheet.hairlineWidth,
      ...Platform.select({
        ios: {
          height: getStatusBarHeight(true),
        },
        web: {
          height: 0,
          borderBottomWidth: 0,
        },
      }),
      '.transparent': {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      },
    },
  },
}));

const MyStatusBar = p => (
  <View MyStatusBar transparent={p.transparent}>
    <StatusBar
      backgroundColor={p.transparent ? 'transparent' : v.brekekeShade3}
      barStyle="dark-content"
    />
  </View>
);

export default MyStatusBar;
