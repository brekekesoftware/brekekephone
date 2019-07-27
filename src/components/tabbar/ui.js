import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity as Button,
  View,
} from 'react-native';

import { rem, std } from '../../styleguide';

const st = {
  main: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: std.color.shade1,
    borderColor: std.color.shade4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  tab: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },

  tabIcon: {
    fontFamily: std.font.icon,

    fontSize: Platform.select({
      ios: rem(32),
      android: std.iconSize.md,
      web: std.iconSize.md,
    }),

    lineHeight: std.iconSize.md + std.gap.md * 2,
    color: std.color.shade5,
  },
};

const Calls = p => (
  <Button style={st.tab} onPress={p.press}>
    <Text style={st.tabIcon}>icon_phone_pick</Text>
  </Button>
);

const Settings = p => (
  <Button style={st.tab} onPress={p.press}>
    <Text style={st.tabIcon}>icon_settings</Text>
  </Button>
);

const Users = p => (
  <Button style={st.tab} onPress={p.press}>
    <Text style={st.tabIcon}>icon_users</Text>
  </Button>
);

const Chats = p => (
  <Button style={st.tab} onPress={p.press}>
    <Text style={st.tabIcon}>icon_message_circle</Text>
  </Button>
);

const Books = p => (
  <Button style={st.tab} onPress={p.press}>
    <Text style={st.tabIcon}>icon_book</Text>
  </Button>
);

const Tabbar = p => (
  <View style={st.main}>
    <Books press={p.pressBooks} />
    <Users press={p.pressUsers} />
    {(p.runningIds.length !== 0 && <Calls press={p.pressCallsManage} />) ||
      null}
    {(p.runningIds.length === 0 && <Calls press={p.pressCallsCreate} />) ||
      null}
    {(p.chatsEnabled && <Chats press={p.pressChats} />) || null}
    <Settings press={p.pressSettings} />
  </View>
);

export default Tabbar;
