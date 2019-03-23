import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView as Scroll,
  TouchableOpacity as Button,
  Text,
} from 'react-native';
import { std } from '../styleguide';
import UserLanguage from '../../language/UserLanguage';

const st = StyleSheet.create({
  main: {
    backgroundColor: std.color.shade3,
    flex: 1,
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
  navbarRightOpt: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: std.gap.lg,
    top: 0,
    bottom: 0,
    paddingLeft: std.gap.lg,
  },
  navbarOptText: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    color: std.color.action,
  },
  profile: {
    backgroundColor: std.color.shade0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: std.gap.lg,
    paddingVertical: std.gap.md,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  profileInfo: {
    flex: 1,
  },
  profileTitle: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.shade9,
  },
  profileSubtitle: {
    fontFamily: std.font.text,
    fontSize: std.textSize.sm,
    lineHeight: std.textSize.sm + std.gap.sm * 2,
    color: std.color.shade5,
  },
  profileAction: {
    width: std.iconSize.md * 2,
    height: std.iconSize.md * 2,
    borderRadius: std.iconSize.md,
    borderColor: std.color.shade3,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: std.gap.lg,
  },
  dangerIcon: {
    fontFamily: std.font.icon,
    fontSize: std.iconSize.md,
    color: std.color.danger,
  },
  actionIcon: {
    fontFamily: std.font.icon,
    fontSize: std.iconSize.md,
    color: std.color.action,
  },
  profiles: {
    flex: 1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMessage: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    color: std.color.shade5,
  },
});

const Navbar = p => (
  <View style={st.navbar}>
    <Text style={st.navbarTitle}>
      {UserLanguage.getUserzMessage_s(
        'com.brekeke.phone.app.modules.profiles-manage.PROFILES',
      )}
    </Text>
    <Button style={st.navbarRightOpt} onPress={p.create}>
      <Text style={st.navbarOptText}>Create</Text>
    </Button>
  </View>
);

const ProfileItem = p => (
  <View style={st.profile}>
    <View style={st.profileInfo}>
      {p.pbxTenant ? (
        <Text style={st.profileTitle}>
          {p.pbxTenant}/{p.pbxUsername}
        </Text>
      ) : (
        <Text style={st.profileTitle}>{p.pbxUsername}</Text>
      )}
      <Text style={st.profileSubtitle}>
        {p.pbxHostname}:{p.pbxPort}
      </Text>
    </View>
    <Button style={st.profileAction} onPress={p.remove}>
      <Text style={st.dangerIcon}>icon_trash</Text>
    </Button>
    <Button style={st.profileAction} onPress={p.update}>
      <Text style={st.actionIcon}>icon_edit_2</Text>
    </Button>
    <Button style={st.profileAction} onPress={p.signin}>
      <Text style={st.actionIcon}>icon_log_in</Text>
    </Button>
  </View>
);

const Profiles = p =>
  p.ids.length ? (
    <Scroll style={st.profiles}>
      {p.ids.map(id => (
        <ProfileItem
          key={id}
          {...p.resolve(id)}
          remove={() => p.remove(id)}
          update={() => p.update(id)}
          signin={() => p.signin(id)}
        />
      ))}
    </Scroll>
  ) : (
    <View style={st.empty}>
      <Text style={st.emptyMessage}>Empty</Text>
    </View>
  );

const ProfilesManage = p => (
  <View style={st.main}>
    <Navbar create={p.create} />

    <Profiles
      ids={p.profileIds}
      resolve={p.resolveProfile}
      remove={p.remove}
      update={p.update}
      signin={p.signin}
    />
  </View>
);

export default ProfilesManage;
