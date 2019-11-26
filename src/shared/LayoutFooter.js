import React from 'react';
import { getBottomSpace } from 'react-native-iphone-x-helper';

import g from '../global';
import { StyleSheet, View } from '../native/Rn';
import FooterActions from './FooterActions';
import FooterNavigation from './FooterNavigation';

const s = StyleSheet.create({
  LayoutFooter: {
    position: `absolute`,
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: getBottomSpace(),
    backgroundColor: g.bg,
    ...g.boxShadow,
  },
  LayoutFooter__hasActions: {
    paddingTop: 8,
    paddingBottom: 8 + getBottomSpace(),
    // paddingHorizontal: 15,
  },
  LayoutFooter__hasActionsInputChat: {
    bottom: 38,
  },
  LayoutFooter_Actions: {
    flexDirection: `row`,
    width: `100%`,
    minWidth: 260,
    maxWidth: g.maxModalWidth,
    marginHorizontal: `auto`,
  },
});

const LayoutFooter = ({
  LayoutChat,
  PhoneBook,
  actions,
  navigation,
  style,
}) => (
  <View
    style={[
      s.LayoutFooter,
      actions && !navigation && s.LayoutFooter__hasActions,
      LayoutChat && s.LayoutFooter__hasActionsInputChat,
      PhoneBook && s.LayoutFooter__hasActionsInputChat,
      style,
    ]}
  >
    {actions && !navigation && (
      <View style={s.LayoutFooter_Actions}>
        <FooterActions {...actions} LayoutChat={LayoutChat} />
      </View>
    )}
    {navigation && <FooterNavigation {...navigation} />}
  </View>
);

export default LayoutFooter;
