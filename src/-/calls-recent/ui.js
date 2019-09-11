import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity as Button,
  View,
} from 'react-native';

import { std } from '../styleguide';

const monthName = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const formatTime = time => {
  time = new Date(time);
  const month = monthName[time.getMonth()];
  const day = time.getDate();
  const hour = time
    .getHours()
    .toString()
    .padStart(2, '0');
  const min = time
    .getMinutes()
    .toString()
    .padStart(2, '0');
  return `${month} ${day} - ${hour}:${min}`;
};

const st = {
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

  optIconAction: {
    fontFamily: std.font.icon,
    fontSize: std.iconSize.md,
    color: std.color.action,
  },

  optIconDanger: {
    fontFamily: std.font.icon,
    fontSize: std.iconSize.md,
    color: std.color.danger,
  },

  call: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: std.gap.lg,
    paddingVertical: std.gap.lg,
    backgroundColor: std.color.shade0,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  callIconMissed: {
    fontFamily: std.font.icon,
    fontSize: std.iconSize.md,
    color: std.color.danger,
    width: std.iconSize.md,
    marginRight: std.gap.lg,
  },

  callIconIncoming: {
    fontFamily: std.font.icon,
    fontSize: std.iconSize.md,
    color: std.color.notice,
    width: std.iconSize.md,
    marginRight: std.gap.lg,
  },

  callIconOutgoing: {
    fontFamily: std.font.icon,
    fontSize: std.iconSize.md,
    color: std.color.action,
    width: std.iconSize.md,
    marginRight: std.gap.lg,
  },

  callInfo: {
    flex: 1,
  },

  callCreated: {
    fontFamily: std.font.text,
    fontSize: std.textSize.sm,
    lineHeight: std.textSize.sm + std.gap.sm * 2,
    color: std.color.shade5,
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

  callOpt: {
    width: std.iconSize.md * 2,
    height: std.iconSize.md * 2,
    borderRadius: std.iconSize.md,
    borderColor: std.color.shade4,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: std.gap.lg,
  },
};

const Navbar = p => (
  <View style={st.navbar}>
    {(() => {
      if (p.parkingIds && p.parkingIds.length !== 0) {
        return (
          <Button style={st.navbarLeftOpt} onPress={p.gotoCallsManage}>
            <Text style={st.navbarOptText}>Calls</Text>
          </Button>
        );
      }
    })()}
    <Text style={st.navbarTitle}>Recent Calls</Text>
    <Button style={st.navbarRightOpt} onPress={p.gotoCallsCreate}>
      <Text style={st.navbarOptText}>Dial</Text>
    </Button>
  </View>
);

const Call = p => (
  <View style={st.call}>
    {p.incoming && p.answered && (
      <Text style={st.callIconIncoming}>icon_phone_incoming</Text>
    )}
    {p.incoming && !p.answered && (
      <Text style={st.callIconMissed}>icon_phone_missed</Text>
    )}
    {!p.incoming && (
      <Text style={st.callIconOutgoing}>icon_phone_outgoing</Text>
    )}
    <View style={st.callInfo}>
      <Text style={st.callCreated}>{formatTime(p.created)}</Text>
      <Text style={st.callName}>{p.partyName || p.partyNumber}</Text>
      <Text style={st.callNumber}>{p.partyNumber}</Text>
    </View>
    <Button style={st.callOpt} onPress={p.remove}>
      <Text style={st.optIconDanger}>icon_trash</Text>
    </Button>
    <Button style={st.callOpt} onPress={p.callBack}>
      <Text style={st.optIconAction}>icon_phone_pick</Text>
    </Button>
  </View>
);

const Calls = p => (
  <ScrollView style={st.calls}>
    {p.ids.map(id => (
      <Call
        key={id}
        {...p.resolve(id)}
        callBack={() => p.callBack(id)}
        remove={() => p.remove(id)}
      />
    ))}
  </ScrollView>
);

const CallsRecent = p => (
  <View style={st.main}>
    <Navbar
      gotoCallsManage={p.gotoCallsManage}
      gotoCallsCreate={p.gotoCallsCreate}
      parkingIds={p.parkingIds}
    />
    <Calls
      ids={p.callIds}
      resolve={p.resolveCall}
      callBack={p.callBack}
      remove={p.removeCall}
    />
  </View>
);

export default CallsRecent;
