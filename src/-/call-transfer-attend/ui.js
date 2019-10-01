import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity as Button,
  View,
} from 'react-native';

import { std } from '../styleguide';

const st = StyleSheet.create({
  noCall: {
    flex: 1,
    backgroundColor: std.color.shade3,
    justifyContent: `center`,
    alignItems: `center`,
  },

  noCallMessage: {
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
    alignItems: `center`,
    justifyContent: `center`,
    paddingVertical: std.gap.sm,
    borderColor: std.color.shade4,
    borderBottomWidth: 1,
  },

  navbarTitle: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.shade9,
  },

  navbarLeftOpt: {
    alignItems: `center`,
    justifyContent: `center`,
    position: `absolute`,
    left: std.gap.lg,
    top: 0,
    bottom: 0,
    paddingRight: std.gap.lg,
  },

  navbarOptText: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.action,
  },

  call: {
    padding: std.gap.lg,
    backgroundColor: std.color.shade0,
  },

  partyName: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.shade9,
  },

  partyNumber: {
    fontFamily: std.font.text,
    fontSize: std.textSize.sm,
    lineHeight: std.textSize.sm + std.gap.sm * 2,
    color: std.color.shade5,
  },

  target: {
    backgroundColor: std.color.shade0,
    padding: std.gap.lg,
    borderColor: std.color.shade4,
    borderBottomWidth: 1,
  },

  targetNumber: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.shade9,
  },

  opt: {
    backgroundColor: std.color.shade0,
    flexDirection: `row`,
    alignItems: `center`,
    padding: std.gap.lg,
    borderColor: std.color.shade4,
    borderBottomWidth: 1,
  },

  optTitle: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.shade9,
    flex: 1,
  },

  divider: {
    paddingLeft: std.gap.lg,
    paddingTop: std.gap.lg * 2,
    paddingBottom: std.gap.lg,
    borderColor: std.color.shade4,
    borderBottomWidth: 1,
  },

  dividerTitle: {
    fontFamily: std.font.text,
    fontSize: std.textSize.sm,
    color: std.color.shade5,
  },
});

const Call = p => (
  <View style={st.call}>
    <Text style={st.partyName}>{p.partyName || p.partyNumber}</Text>
    <Text style={st.partyNumber}>{p.partyNumber}</Text>
  </View>
);

const Divider = ({ children }) => (
  <View style={st.divider}>
    <Text style={st.dividerTitle}>{children}</Text>
  </View>
);

const Main = function(p) {
  return (
    <View style={st.main}>
      <View style={st.navbar}>
        <Button style={st.navbarLeftOpt} onPress={p.back}>
          <Text style={st.navbarOptText}>Back</Text>
        </Button>
        <Text style={st.navbarTitle}>Attended Transfer</Text>
      </View>
      <Divider>CALL</Divider>
      <Call {...p.call} />
      <Divider>TARGET</Divider>
      <View style={st.target}>
        <Text style={st.targetNumber}>{p.call.transfering}</Text>
      </View>
      <Divider>ACTIONS</Divider>
      <Button style={st.opt} onPress={p.hangup}>
        <Text style={st.optTitle}>End Call and Complete Transfer</Text>
      </Button>
      <Button style={st.opt} onPress={p.stop}>
        <Text style={st.optTitle}>Cancel Transfer</Text>
      </Button>
      <Button style={st.opt} onPress={p.join}>
        <Text style={st.optTitle}>Conference</Text>
      </Button>
    </View>
  );
};

const NoCall = p => (
  <View style={st.main}>
    <View style={st.navbar}>
      <Button style={st.navbarLeftOpt} onPress={p.back}>
        <Text style={st.navbarOptText}>Back</Text>
      </Button>
      <Text style={st.navbarTitle}>Attended Transfer</Text>
    </View>
    <View style={st.noCall}>
      <Text style={st.noCallMessage}>The call is no longer available</Text>
    </View>
  </View>
);

const CallTransferAttend = p =>
  p.call ? <Main {...p} /> : <NoCall back={p.back} />;
export default CallTransferAttend;
