import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity as Button,
  Text,
  TextInput,
} from 'react-native';
import { std } from '../styleguide';

const st = {
  notFound: {
    flex: 1,
    backgroundColor: std.color.shade3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundMessage: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    color: std.color.shade5,
    lineHeight: std.textSize.md + std.gap.md * 2,
  },
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
  navbarOptLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: std.gap.lg,
    top: 0,
    bottom: 0,
    paddingRight: std.gap.lg,
  },
  navbarOptRight: {
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
  divider: {
    paddingLeft: std.gap.lg,
    paddingTop: std.gap.lg * 2,
    paddingBottom: std.gap.lg,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dividerTitle: {
    fontFamily: std.font.text,
    fontSize: std.textSize.sm,
    color: std.color.shade5,
  },
  form: {
    paddingLeft: std.gap.lg,
    backgroundColor: std.color.shade0,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  profile: {
    paddingVertical: std.gap.lg,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  profileTitle: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    color: std.color.shade9,
    lineHeight: std.textSize.md + std.gap.md * 2,
  },
  profileCaption: {
    fontFamily: std.font.text,
    fontSize: std.textSize.sm,
    color: std.color.shade5,
    lineHeight: std.textSize.sm + std.gap.sm * 2,
  },
  passwordInput: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    color: std.color.shade9,
    paddingVertical: 0,
    paddingHorizontal: 0,
    height: std.textSize.md + std.gap.lg * 2,
  },
};

const Divider = ({ children }) => (
  <View style={st.divider}>
    <Text style={st.dividerTitle}>{children}</Text>
  </View>
);

const Form = p => (
  <View style={st.form}>
    <View style={st.profile}>
      <Text style={st.profileTitle}>
        {p.tenant ? p.tenant + '/' : ''}
        {p.username}
      </Text>
      <Text style={st.profileCaption}>{p.hostname + ':' + p.port}</Text>
    </View>
    <TextInput
      style={st.passwordInput}
      autoFocus
      secureTextEntry
      placeholder="Password"
      value={p.password}
      onChangeText={p.setPassword}
      editable={p.editable}
    />
  </View>
);

const Main = p => (
  <View style={st.main}>
    <View style={st.navbar}>
      <Button style={st.navbarOptLeft} onPress={p.back}>
        <Text style={st.navbarOptText}>Back</Text>
      </Button>
      <Text style={st.navbarTitle}>Signing in</Text>
      <Button style={st.navbarOptRight} onPress={p.signin}>
        <Text style={st.navbarOptText}>Sign in</Text>
      </Button>
    </View>
    <Divider>PBX</Divider>
    <Form
      editable={!p.started}
      hostname={p.pbxHostname}
      port={p.pbxPort}
      tenant={p.pbxTenant}
      username={p.pbxUsername}
      password={p.pbxPassword}
      setPassword={p.setPbxPassword}
    />
  </View>
);

const NotFound = p => (
  <View style={st.main}>
    <View style={st.navbar}>
      <Button style={st.navbarOptLeft} onPress={p.back}>
        <Text style={st.navbarOptText}>Back</Text>
      </Button>
      <Text style={st.navbarTitle}>Signing in</Text>
    </View>
    <View style={st.notFound}>
      <Text style={st.notFoundMessage}>The profile is no longer available</Text>
    </View>
  </View>
);

const ProfileSignin = ({ profile, ...rest }) =>
  profile ? <Main {...profile} {...rest} /> : <NotFound back={rest.back} />;

export default ProfileSignin;
