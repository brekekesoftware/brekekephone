import React from 'react';
import { getBottomSpace } from 'react-native-iphone-x-helper';

import g from '../global';
import { StyleSheet, View } from '../native/Rn';
import FooterActions from './FooterActions';
import FooterNavigation from './FooterNavigation';

const css = StyleSheet.create({
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
  },
  LayoutFooter__hasActionsInputChat: {
    bottom: 0,
  },
  LayoutFooter_Actions: {
    flexDirection: `row`,
    width: `100%`,
    minWidth: 260,
    maxWidth: g.maxModalWidth,
  },
  LayoutFooter_Actions__hasNavigation: {
    marginVertical: 10,
  },
  LayoutFooter_ActionsSpacing: {
    flex: 1,
  },
});

const LayoutFooter = ({
  LayoutChat,
  Phonebook,
  actions,
  forceDisplayActions,
  navigation,
  style,
}) => (
  <View
    style={[
      css.LayoutFooter,
      actions && !navigation && css.LayoutFooter__hasActions,
      LayoutChat && css.LayoutFooter__hasActionsInputChat,
      Phonebook && css.LayoutFooter__hasActionsInputChat,
      style,
    ]}
  >
    {actions && (forceDisplayActions || !navigation) && (
      <View
        style={{
          alignItems: `center`,
          flexDirection: `row`,
        }}
      >
        <View style={css.LayoutFooter_ActionsSpacing} />
        <View
          style={[
            css.LayoutFooter_Actions,
            navigation && css.LayoutFooter_Actions__hasNavigation,
          ]}
        >
          <FooterActions {...actions} LayoutChat={LayoutChat} />
        </View>
        <View style={css.LayoutFooter_ActionsSpacing} />
      </View>
    )}
    {navigation && <FooterNavigation {...navigation} />}
  </View>
);

export default LayoutFooter;
