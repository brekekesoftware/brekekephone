import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity as Button,
  Text,
  Image,
} from 'react-native';
import { std } from '../../styleguide';

const st = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: std.color.shade3,
  },
  navbar: {
    backgroundColor: std.color.shade1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: std.gap.sm,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navbarTitle: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.shade9,
  },
  chats: {
    flex: 1,
  },
  chat: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: std.gap.lg,
    paddingRight: std.gap.sm,
    paddingVertical: std.gap.lg,
    backgroundColor: std.color.shade0,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chatIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: std.iconSize.lg * 2 + StyleSheet.hairlineWidth * 2,
    height: std.iconSize.lg * 2 + StyleSheet.hairlineWidth * 2,
    borderRadius: std.iconSize.lg,
    backgroundColor: std.color.shade1,
    borderColor: std.color.shade4,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: std.gap.lg,
  },
  buddyAvatar: {
    width: std.iconSize.lg * 2,
    height: std.iconSize.lg * 2,
    borderRadius: std.iconSize.lg,
  },
  chatName: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.shade9,
  },
  chatOffline: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: std.gap.lg,
    height: std.gap.lg,
    borderRadius: std.gap.lg / 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: std.color.shade0,
    backgroundColor: std.color.shade5,
  },
  chatOnline: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: std.gap.lg,
    height: std.gap.lg,
    borderRadius: std.gap.lg / 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: std.color.shade0,
    backgroundColor: std.color.active,
  },
  chatIdle: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: std.gap.lg,
    height: std.gap.lg,
    borderRadius: std.gap.lg / 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: std.color.shade0,
    backgroundColor: std.color.notice,
  },
  chatBusy: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: std.gap.lg,
    height: std.gap.lg,
    borderRadius: std.gap.lg / 2,
    borderColor: std.color.shade0,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: std.color.danger,
  },
  chatChevronIcon: {
    fontFamily: std.font.icon,
    fontSize: std.iconSize.md,
    color: std.color.action,
    marginLeft: 'auto',
  },
  createGroup: {
    alignItems: 'center',
    paddingVertical: std.gap.lg,
    backgroundColor: std.color.shade0,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  createGroupText: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.action,
  },
  groupIcon: {
    fontFamily: std.font.icon,
    fontSize: std.iconSize.md,
    color: std.color.shade5,
  },
});

const Navbar = p => (
  <View style={st.navbar}>
    <Text style={st.navbarTitle}>Chats</Text>
  </View>
);

const Buddy = p => (
  <Button style={st.chat} onPress={p.select}>
    <View style={st.chatIcon}>
      <Image style={st.buddyAvatar} source={{ uri: p.avatar }} />
      {p.offline && <View style={st.chatOffline} />}
      {p.online && <View style={st.chatOnline} />}
      {p.idle && <View style={st.chatIdle} />}
      {p.busy && <View style={st.chatBusy} />}
    </View>
    {(() => {
      if (p.name) {
        return <Text style={st.chatName}>{p.name}</Text>;
      } else {
        return <Text style={st.chatName}>{p.id}</Text>;
      }
    })()}
    <Text style={st.chatChevronIcon}>icon_chevron_right</Text>
  </Button>
);

const Buddies = p =>
  p.ids.map(id => (
    <Buddy key={id} {...p.byid[id]} select={() => p.select(id)} />
  ));

const Group = p => (
  <Button style={st.chat} onPress={p.select}>
    <View style={st.chatIcon}>
      <Text style={st.groupIcon}>icon_users</Text>
    </View>
    <Text style={st.chatName}>{p.name}</Text>
    <Text style={st.chatChevronIcon}>icon_chevron_right</Text>
  </Button>
);

const Groups = p =>
  p.ids.map(id => (
    <Group key={id} {...p.byid[id]} select={() => p.select(id)} />
  ));

const ChatsRecent = p => (
  <View style={st.main}>
    <Navbar />
    <Button style={st.createGroup} onPress={p.createGroup}>
      <Text style={st.createGroupText}>Create Group</Text>
    </Button>
    <ScrollView style={st.chats}>
      <Buddies ids={p.buddyIds} byid={p.buddyById} select={p.selectBuddy} />
      <Groups ids={p.groupIds} byid={p.groupById} select={p.selectGroup} />
    </ScrollView>
  </View>
);

export default ChatsRecent;
