import React from 'react';

import g from '../global';
import { StyleSheet, Text, TouchableOpacity, View } from '../native/Rn';
import { getSubMenus } from '../shared/navigationConfig';

const css = StyleSheet.create({
  Navigation: {
    flexDirection: `row`,
    alignSelf: `stretch`,
    backgroundColor: g.bg,
  },
  Btn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: `center`,
    borderBottomWidth: 3,
    borderColor: g.borderBg,
  },
  Btn__active: {
    borderColor: g.colors.primary,
  },
  Text__active: {
    color: g.colors.primary,
  },
});

const Navigation = ({ menu, subMenu }) => (
  <View style={css.Navigation}>
    {getSubMenus(menu).map(s => {
      const active = s.key === subMenu;
      return (
        <TouchableOpacity
          key={s.key}
          onPress={active ? null : s.navFn}
          style={[css.Btn, active && css.Btn__active]}
        >
          <Text small style={active && css.Text__active}>
            {s.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

export default Navigation;
