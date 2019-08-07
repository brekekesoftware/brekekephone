import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity as Button,
  View,
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

  videoSwitch: {
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

  actions: {
    flexDirection: 'row',
    paddingVertical: std.gap.lg,
    alignSelf: 'flex-end',
    marginHorizontal: std.gap.sm,
  },

  actionButton: {
    marginLeft: std.gap.md,
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
    margin: std.gap.md,
  },
});

const pure = Component =>
  class Pure extends React.PureComponent {
    render = () => <Component {...this.props} />;
  };

const Navbar = pure(p => (
  <View style={st.navbar}>
    {(() => {
      if (p.parkingIds && p.parkingIds.length !== 0) {
        return (
          <Button style={st.navbarLeftOpt} onPress={p.calls}>
            <Text style={st.navbarOptText}>Calls</Text>
          </Button>
        );
      }
    })()}
    <Text style={st.navbarTitle}>Dial</Text>
    <Button style={st.navbarRightOpt} onPress={p.recent}>
      <Text style={st.navbarOptText}>Recent</Text>
    </Button>
  </View>
));

const Actions = p => (
  <View style={st.controlOpts}>
    <Button style={st.controlOpt} onPress={p.callVoice}>
      <Text style={st.optIcon}>icon_phone_pick</Text>
    </Button>
    <Button style={st.controlOpt} onPress={p.callVideo}>
      <Text style={st.optIcon}>icon_video_on</Text>
    </Button>
  </View>
);

const Target = p => (
  <React.Fragment>
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
    <Actions callVideo={p.callVideo} callVoice={p.callVoice} />
  </React.Fragment>
);

const Match = p => (
  <Button style={st.match} onPress={() => p.select(p.number)}>
    <View style={st.matchInfo}>
      <Text style={st.matchName}>{p.name || p.number}</Text>
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

const Matches = p => (
  <ScrollView style={st.matches}>
    {p.ids.map(id => (
      <Match key={id} {...p.resolve(id)} select={p.select} />
    ))}
  </ScrollView>
);

const CallsCreate = p => (
  <View style={st.main}>
    <Navbar calls={p.calls} recent={p.recent} parkingIds={p.parkingIds} />
    <Target
      target={p.target}
      setTarget={p.setTarget}
      callVideo={p.callVideo}
      callVoice={p.callVoice}
    />
    <Matches ids={p.matchIds} resolve={p.resolveMatch} select={p.selectMatch} />
  </View>
);

export default CallsCreate;
