import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';

import v from '../variables';

const css = StyleSheet.create({
  RnStatusBar: {
    backgroundColor: v.hoverBg,
    ...v.backdropZindex,
    ...Platform.select({
      ios: {
        height: getStatusBarHeight(true),
      },
    }),
  },
  RnStatusBar__transparent: {
    backgroundColor: `transparent`,
    borderColor: `transparent`,
  },
  Border: {
    position: `absolute`,
    bottom: 0,
    left: 0,
    right: 0,
    borderColor: v.borderBg,
    borderBottomWidth: 1,
    ...v.backdropZindex,
  },
});

const RnStatusBar = props =>
  Platform.OS === `web` ? null : (
    <View
      style={[
        css.RnStatusBar,
        props.transparent && css.RnStatusBar__transparent,
      ]}
    >
      <StatusBar backgroundColor={v.hoverBg} barStyle="dark-content" />
      <View style={css.Border} />
    </View>
  );

export default RnStatusBar;
