import React from 'react';
import {
  Platform,
  StatusBar as RnStatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';

import v from '../variables';

const s = StyleSheet.create({
  StatusBar: {
    backgroundColor: v.brekekeShade2,
    borderColor: v.brekekeShade3,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        height: getStatusBarHeight(true),
      },
    }),
  },
  StatusBar__transparent: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
});

const StatusBar = p =>
  Platform.OS === 'web' ? null : (
    <View style={[s.StatusBar, p.transparent && s.StatusBar__transparent]}>
      <RnStatusBar backgroundColor={v.brekekeShade2} barStyle="dark-content" />
    </View>
  );

export default StatusBar;
