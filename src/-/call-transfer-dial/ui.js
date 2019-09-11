import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity as Button,
  View,
} from 'react-native';

import { std } from '../styleguide';

const st = StyleSheet.create({
  noCall: {
    flex: 1,
    backgroundColor: std.color.shade3,
    justifyContent: 'center',
    alignItems: 'center',
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

  navbarLeftOpt: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: std.gap.lg,
    top: 0,
    bottom: 0,
    paddingRight: std.gap.lg,
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

  opt: {
    backgroundColor: std.color.shade0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: std.gap.lg,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  optTitle: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.shade9,
  },

  attendedSwitch: {
    marginLeft: 'auto',
  },

  targetInput: {
    flex: 1,
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    paddingVertical: 0,
    paddingHorizontal: 0,
    height: std.textSize.md + std.gap.md * 2,
    color: std.color.shade9,
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

  matches: {
    flex: 1,
    backgroundColor: std.color.shade0,
  },

  match: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: std.gap.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: std.color.shade4,
  },

  matchInfo: {
    flex: 1,
  },

  matchCalling: {
    width: std.gap.md,
    height: std.gap.md,
    borderRadius: std.gap.md / 2,
    backgroundColor: std.color.danger,
  },

  matchRinging: {
    width: std.gap.md,
    height: std.gap.md,
    borderRadius: std.gap.md / 2,
    backgroundColor: std.color.danger,
  },

  matchHolding: {
    width: std.gap.md,
    height: std.gap.md,
    borderRadius: std.gap.md / 2,
    backgroundColor: std.color.notice,
  },

  matchTalking: {
    width: std.gap.md,
    height: std.gap.md,
    borderRadius: std.gap.md / 2,
    backgroundColor: std.color.danger,
  },

  matchName: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    color: std.color.shade9,
    lineHeight: std.textSize.md + std.gap.md * 2,
  },

  matchNumber: {
    fontFamily: std.font.text,
    fontSize: std.textSize.sm,
    color: std.color.shade5,
    lineHeight: std.textSize.sm + std.gap.sm * 2,
  },

  optIcon: {
    fontFamily: std.font.icon,
    fontSize: std.iconSize.md,
    color: std.color.action,
  },

  controlOpts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },

  controlOpt: {
    justifyContent: 'center',
    alignItems: 'center',
    width: std.iconSize.md * 2,
    height: std.iconSize.md * 2,
    borderRadius: std.iconSize.md,
    borderColor: std.color.shade4,
    borderWidth: StyleSheet.hairlineWidth,
    marginHorizontal: std.gap.md,
    marginBottom: std.gap.md,
  },
});

const pure = Component =>
  class Pure extends React.PureComponent {
    render() {
      return <Component {...this.props} />;
    }
  };

const MainNavbar = pure(p => (
  <View style={st.navbar}>
    <Button style={st.navbarLeftOpt} onPress={p.back}>
      <Text style={st.navbarOptText}>Back</Text>
    </Button>
    <Text style={st.navbarTitle}>Transfering Call</Text>
  </View>
));

const Call = pure(p => (
  <React.Fragment>
    <Divider>CALL</Divider>
    <View style={st.call}>
      <Text style={st.partyName}>{p.partyName || p.partyNumber}</Text>
      <Text style={st.partyNumber}>{p.partyNumber}</Text>
    </View>
  </React.Fragment>
));

const Divider = pure(({ children }) => (
  <View style={st.divider}>
    <Text style={st.dividerTitle}>{children}</Text>
  </View>
));

const Actions = p => (
  <View style={st.controlOpts}>
    <Button style={st.controlOpt} onPress={p.transferAttended}>
      <Text style={st.optIcon}>icon_phone_forwarded</Text>
    </Button>
    <Button style={st.controlOpt} onPress={p.transferBlind}>
      <Text style={st.optIcon}>icon_phone_pick</Text>
    </Button>
  </View>
);

const Target = pure(p => (
  <React.Fragment>
    <Divider>TARGET</Divider>
    <View style={st.opt}>
      <TextInput
        style={st.targetInput}
        autoFocus
        keyboardType="default"
        placeholder="Enter name or number"
        value={p.target}
        onChangeText={p.setTarget}
      />
    </View>
    <Actions
      transfer={p.transfer}
      transferAttended={p.transferAttended}
      transferBlind={p.transferBlind}
      transferAttendedForVideo={p.transferAttendedForVideo}
    />
  </React.Fragment>
));

const Match = pure(p => {
  const matchName = p.name && p.name.length !== 0 ? p.name : p.number;

  return (
    <Button style={st.match} onPress={() => p.select(p.number)}>
      <View style={st.matchInfo}>
        <Text style={st.matchName}>{matchName}</Text>
        <Text style={st.matchNumber}>{p.number}</Text>
      </View>
      {p.talking ? (
        <View style={st.matchTalking} />
      ) : p.ringing ? (
        <View style={st.matchRinging} />
      ) : p.calling ? (
        <View style={st.matchCalling} />
      ) : p.holding ? (
        <View style={st.matchHolding} />
      ) : null}
    </Button>
  );
});

const Matches = pure(p => (
  <ScrollView style={st.matches}>
    {p.ids.map(id => (
      <Match key={id} {...p.resolve(id)} select={p.select} />
    ))}
  </ScrollView>
));

const Main = function(p) {
  return (
    <View style={st.main}>
      <MainNavbar back={p.back} />
      <Call {...p.call} />
      <Target
        target={p.target}
        setTarget={p.setTarget}
        transferAttended={p.transferAttended}
        transferBlind={p.transferBlind}
        transferAttendedForVideo={p.transferAttendedForVideo}
      />
      <Matches
        ids={p.matchIds}
        resolve={p.resolveMatch}
        select={p.selectMatch}
      />
    </View>
  );
};

const NoCall = p => (
  <View style={st.main}>
    <View style={st.navbar}>
      <Button style={st.navbarLeftOpt} onPress={p.back}>
        <Text style={st.navbarOptText}>Back</Text>
      </Button>
      <Text style={st.navbarTitle}>Transfering Call</Text>
    </View>
    <View style={st.noCall}>
      <Text style={st.noCallMessage}>The call is no longer available.</Text>
    </View>
  </View>
);

const CallTransferDial = p =>
  p.call ? <Main {...p} /> : <NoCall back={p.back} />;
export default CallTransferDial;
