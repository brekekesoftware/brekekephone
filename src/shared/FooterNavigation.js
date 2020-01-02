import React from 'react';

import g from '../global';
import { StyleSheet, TouchableOpacity, View } from '../native/Rn';
import Icon from './Icon';
import { menus } from './navigationConfig';

const css = StyleSheet.create({
  FooterNavigation: {
    flexDirection: `row`,
    alignSelf: `stretch`,
  },
  FooterNavigation_Btn: {
    flex: 1,
    padding: 4,
    alignItems: `center`,
  },
  FooterNavigation_BtnBg: {
    paddingVertical: 8,
    width: `100%`,
  },
  FooterNavigation_BtnBg__active: {
    borderRadius: 22,
    backgroundColor: g.colors.primaryFn(0.5),
  },
});

const FooterNavigation = ({ menu }) => (
  <View style={css.FooterNavigation}>
    {menus.map(m => {
      const active = m.key === menu;
      return (
        <TouchableOpacity
          key={m.key}
          onPress={active ? null : m.navFn}
          style={[
            css.FooterNavigation_Btn,
            // active && css.FooterNavigation_Btn__active,
          ]}
        >
          <View
            style={[
              css.FooterNavigation_BtnBg,
              active && css.FooterNavigation_BtnBg__active,
            ]}
          >
            <Icon path={m.icon} />
          </View>
        </TouchableOpacity>
      );
    })}
  </View>
);

export default FooterNavigation;
