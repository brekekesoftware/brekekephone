import React from 'react';

import g from '../../global';
import { menus } from '../../shared/navigationConfig';
import { Icon, StyleSheet, TouchableOpacity, View } from '../Rn';

const css = StyleSheet.create({
  Navigation: {
    flexDirection: `row`,
    alignSelf: `stretch`,
  },
  Btn: {
    flex: 1,
    padding: 4,
    alignItems: `center`,
  },
  BtnBg: {
    paddingVertical: 8,
    width: `100%`,
  },
  BtnBg__active: {
    borderRadius: 22,
    backgroundColor: g.colors.primaryFn(0.5),
  },
});

const Navigation = ({ menu }) => (
  <View style={css.Navigation}>
    {menus.map(m => {
      const active = m.key === menu;
      return (
        <TouchableOpacity
          key={m.key}
          onPress={active ? null : m.navFn}
          style={css.Btn}
        >
          <View style={[css.BtnBg, active && css.BtnBg__active]}>
            <Icon path={m.icon} />
          </View>
        </TouchableOpacity>
      );
    })}
  </View>
);

export default Navigation;
