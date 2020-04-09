import { observer } from 'mobx-react';
import React from 'react';

import { css as fcss } from '../Footer/Navigation';
import g from '../global';
import chatStore from '../global/chatStore';
import { StyleSheet, Text, TouchableOpacity, View } from '../Rn';
import { getSubMenus } from '../shared/navigationConfig';

const css = StyleSheet.create({
  Navigation: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    backgroundColor: g.bg,
  },
  Btn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderColor: g.borderBg,
  },
  Btn__active: {
    borderColor: g.colors.primary,
  },
  Text__active: {
    color: g.colors.primary,
  },
  Unread: {
    top: -5,
    left: 25,
  },
});

const Navigation = ({ menu, subMenu }) => (
  <View style={css.Navigation}>
    {getSubMenus(menu).map(s => {
      const active = s.key === subMenu;
      const totalUnreadChat = Object.values(chatStore.threadConfig).filter(
        v => v.isUnread,
      ).length;
      return (
        <TouchableOpacity
          key={s.key}
          onPress={active ? null : s.navFn}
          style={[css.Btn, active && css.Btn__active]}
        >
          <Text small style={active && css.Text__active}>
            {s.label}
          </Text>
          {s.key === 'chat' && !!totalUnreadChat && (
            <View style={fcss.UnreadOuter}>
              <View style={[fcss.Unread, css.Unread]}>
                <Text style={fcss.UnreadText} bold white center>
                  {totalUnreadChat}
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      );
    })}
  </View>
);

export default observer(Navigation);
