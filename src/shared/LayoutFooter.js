import React from 'react';

import { StyleSheet, View } from '../native/Rn';
import ActionButtons from './ActionButtons';

const s = StyleSheet.create({
  LayoutFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: 'white',
  },
  LayoutFooter_Btns: {
    flexDirection: 'row',
    width: '100%',
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
