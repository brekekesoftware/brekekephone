import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity as Button,
  Text,
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
  navbarOptText: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.action,
  },
  call: {
    alignItems: 'center',
    padding: std.gap.lg,
    backgroundColor: std.color.shade0,
    marginBottom: std.gap.lg,
  },
  callName: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.shade9,
  },
  callNumber: {
    fontFamily: std.font.text,
    fontSize: std.textSize.sm,
    lineHeight: std.textSize.sm + std.gap.sm * 2,
    color: std.color.shade5,
  },
  keypad: {
    alignItems: 'center',
    backgroundColor: std.color.shade0,
    paddingTop: std.gap.lg,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  keyRow: {
    flexDirection: 'row',
  },
  keyCell: {
    justifyContent: 'center',
    alignItems: 'center',
    width: std.iconSize.md * 2,
    height: std.iconSize.md * 2,
    borderRadius: std.iconSize.md,
    borderColor: std.color.shade3,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: std.gap.lg,
    marginHorizontal: std.gap.md,
  },
  keyText: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.action,
  },
});

const Call = p => (
  <View style={st.call}>
    <Text style={st.callName}>{p.partyName || 'Unnamed'}</Text>
    <Text style={st.callNumber}>{p.partyNumber}</Text>
  </View>
);

const keys = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
];

const Keypad = p => (
  <View style={st.keypad}>
    {keys.map((row, i) => (
      <View style={st.keyRow} key={i}>
        {row.map(key => (
          <Button style={st.keyCell} key={key} onPress={() => p.press(key)}>
            <Text style={st.keyText}>{key}</Text>
          </Button>
        ))}
      </View>
    ))}
  </View>
);

const Main = p => (
  <View style={st.main}>
    <View style={st.navbar}>
      <Button style={st.navbarLeftOpt} onPress={p.back}>
        <Text style={st.navbarOptText}>Back</Text>
      </Button>
      <Text style={st.navbarTitle}>Call Keypad</Text>
    </View>
    <Call {...p.call} />
    <Keypad press={p.sendKey} />
  </View>
);

const NoCall = p => (
  <View style={st.main}>
    <View style={st.navbar}>
      <Button style={st.navbarLeftOpt} onPress={p.back}>
        <Text style={st.navbarOptText}>Back</Text>
      </Button>
      <Text style={st.navbarTitle}>Call Keypad</Text>
    </View>
    <View style={st.noCall}>
      <Text style={st.noCallMessage}>The call is no longer available</Text>
    </View>
  </View>
);

const CallKeypad = p => (p.call ? <Main {...p} /> : <NoCall back={p.back} />);

export default CallKeypad;
