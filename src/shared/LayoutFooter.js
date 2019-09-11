import React from 'react';
import { StyleSheet, View } from 'react-native';

import v from '../variables';
import ActionButtons from './ActionButtons';

const s = StyleSheet.create({
  LayoutFooter: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'block',
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: 'white',
  },
  LayoutFooter_Btns: {
    display: 'block',
    flexDirection: 'row',
    minWidth: 260,
    maxWidth: 380,
    marginHorizontal: 'auto',
  },
});

const LayoutFooter = ({ style, ...p }) => (
  <View style={[s.LayoutFooter, style]}>
    <View style={s.LayoutFooter_Btns}>
      <ActionButtons {...p} />
    </View>
  </View>
);

export default LayoutFooter;
