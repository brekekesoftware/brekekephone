import React from 'react';

import g from '../global';
import { StyleSheet, TouchableOpacity, View } from '../native/Rn';
import Icon from './Icon';
import { menus } from './navigationConfig';

const s = StyleSheet.create({
  FooterNavigation: {
    flex: 1,
    backgroundColor: g.hoverBg,
  },
  FooterNavigation_Menu: {
    flexDirection: `row`,
    alignSelf: `stretch`,
  },
  FooterNavigation_Menu__sub: {
    position: `absolute`,
    bottom: `100%`,
    left: 0,
    right: 0,
    backgroundColor: g.bg,
    paddingHorizontal: 15,
  },
  FooterNavigation_Btn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: `center`,
  },
  FooterNavigation_Btn__active: {
    backgroundColor: g.bg,
  },
});

const FooterNavigation = ({ menu }) => (
  <View style={s.FooterNavigation}>
    <View style={s.FooterNavigation_Menu}>
      {menus.map(m => {
        const active = m.key === menu;
        return (
          <TouchableOpacity
            key={m.key}
            onPress={active ? null : m.navFn}
            style={[
              s.FooterNavigation_Btn,
              active && s.FooterNavigation_Btn__active,
            ]}
          >
            <Icon path={m.icon} />
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

export default FooterNavigation;
