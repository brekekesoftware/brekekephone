import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity as Button,
  View,
} from 'react-native';

import { rem, std } from '../../styleguide';

const st = StyleSheet.create({
  notify: {
    flexDirection: 'row',
    alignItems: 'center',
    width: rem(320),
    backgroundColor: std.color.notify,
    marginBottom: std.gap.lg,
    alignSelf: 'flex-start',
    borderTopRightRadius: std.gap.lg,
    borderBottomRightRadius: std.gap.lg,
    shadowColor: std.color.shade9,
    shadowRadius: rem(8),
    shadowOpacity: 0.24,

    shadowOffset: {
      width: 0,
      height: rem(4),
    },

    elevation: 3,
  },

  notifyInfo: {
    flex: 1,
    paddingLeft: std.gap.lg,
    paddingVertical: std.gap.sm,
  },

  notifyCatalog: {
    fontFamily: std.font.text,
    fontSize: std.textSize.sm,
    lineHeight: std.textSize.sm + std.gap.sm * 2,
    color: std.color.shade9,
  },

  notifyTitle: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.sm * 2,
    color: std.color.shade9,
  },

  notifySubtitle: {
    fontFamily: std.font.text,
    fontSize: std.textSize.sm,
    lineHeight: std.textSize.sm + std.gap.sm * 2,
    color: std.color.shade9,
  },

  accept: {
    justifyContent: 'center',
    alignItems: 'center',
    width: std.iconSize.lg * 2,
    height: std.iconSize.lg * 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: std.color.active,
    borderRadius: std.iconSize.lg,
    marginHorizontal: std.gap.md,
  },

  acceptIcon: {
    fontFamily: std.font.icon,
    fontSize: std.iconSize.lg,
    color: std.color.active,
  },

  reject: {
    justifyContent: 'center',
    alignItems: 'center',
    width: std.iconSize.lg * 2,
    height: std.iconSize.lg * 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: std.color.danger,
    borderRadius: std.iconSize.lg,
    marginHorizontal: std.gap.md,
  },

  rejectIcon: {
    fontFamily: std.font.icon,
    fontSize: std.iconSize.lg,
    color: std.color.danger,
  },
});

const Notify = p => (
  <View style={st.notify}>
    <View style={st.notifyInfo}>
      <Text style={st.notifyCatalog}>Group chat invited</Text>
      <Text style={st.notifyTitle}>{p.name.toUpperCase()}</Text>
      <Text style={st.notifySubtitle}>by{p.inviter}</Text>
    </View>
    <Button style={st.reject} onPress={p.reject}>
      <Text style={st.rejectIcon}>icon_x</Text>
    </Button>
    <Button style={st.accept} onPress={p.accept}>
      <Text style={st.acceptIcon}>icon_check</Text>
    </Button>
  </View>
);

const ChatGroupsNotify = p =>
  p.groups.map(group => (
    <Notify
      key={group}
      {...p.formatGroup(group)}
      accept={() => p.accept(group)}
      reject={() => p.reject(group)}
    />
  ));

export default ChatGroupsNotify;
