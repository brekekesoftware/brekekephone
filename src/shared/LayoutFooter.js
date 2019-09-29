import React from 'react';

import g from '../global';
import { StyleSheet, View } from '../native/Rn';
import FooterActions from './FooterActions';

const s = StyleSheet.create({
  LayoutFooter: {
    position: `absolute`,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: g.bg,
    ...g.boxShadow,
  },
  LayoutFooter__hasActions: {
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  LayoutFooter_Actions: {
    flexDirection: `row`,
    width: `100%`,
    minWidth: 260,
    maxWidth: g.maxModalWidth,
    marginHorizontal: `auto`,
  },
});

const LayoutFooter = ({ style, actions }) => (
  <View style={[s.LayoutFooter, actions && s.LayoutFooter__hasActions, style]}>
    {actions && (
      <View style={s.LayoutFooter_Actions}>
        <FooterActions {...actions} />
      </View>
    )}
  </View>
);

export default LayoutFooter;
