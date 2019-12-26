import React from 'react';

import g from '../global';
import authStore from '../global/authStore';
import { StyleSheet, Text, TouchableOpacity, View } from '../native/Rn';
import { menus } from './navigationConfig';

const css = StyleSheet.create({
  HeaderNavigation: {
    flexDirection: `row`,
    alignSelf: `stretch`,
    backgroundColor: g.bg,
  },
  HeaderNavigation_Btn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: `center`,
    borderBottomWidth: 3,
    borderColor: g.borderBg,
  },
  HeaderNavigation_Btn__active: {
    borderColor: g.mainDarkBg,
  },
  HeaderNavigation_BtnText__active: {
    color: g.mainDarkBg,
  },
});

const HeaderNavigation = ({ menu, subMenu }) => {
  const m = menus.filter(m => m.key === menu)[0];
  if (!m) {
    return null;
  }
  return (
    <View style={css.HeaderNavigation}>
      {m.subMenus
        .filter(s => !s.ucRequired || authStore.currentProfile?.ucEnabled)
        .map(s => {
          const active = s.key === subMenu;
          return (
            <TouchableOpacity
              key={s.key}
              onPress={active ? null : s.navFn}
              style={[
                css.HeaderNavigation_Btn,
                active && css.HeaderNavigation_Btn__active,
              ]}
            >
              <Text
                small
                style={active && css.HeaderNavigation_BtnText__active}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
    </View>
  );
};

export default HeaderNavigation;
