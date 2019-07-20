import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity as Button,
  View,
} from 'react-native';

import { rem, std } from '../../styleguide';

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
  control: {
    backgroundColor: std.color.shade0,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: std.gap.lg,
    paddingVertical: std.gap.sm,
  },
  controlCall: {
    alignItems: 'center',
    paddingVertical: std.gap.md,
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
  callStatusPlaceholder: {
    width: rem(48),
    height: std.textSize.sm,
    marginVertical: std.gap.sm,
    backgroundColor: std.color.shade3,
  },
  callNamePlaceholder: {
    width: rem(96),
    height: std.textSize.md,
    marginVertical: std.gap.md,
    backgroundColor: std.color.shade3,
  },
  callNumberPlaceholder: {
    width: rem(64),
    height: std.textSize.sm,
    marginVertical: std.gap.sm,
    backgroundColor: std.color.shade3,
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
  callSelected: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth * 5,
    backgroundColor: std.color.active,
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
    color: std.color.active,
    width: std.iconSize.md,
    marginRight: std.gap.lg,
  },
  callIconTalking: {
    fontFamily: std.font.icon,
    fontSize: std.iconSize.md,
    color: std.color.active,
    width: std.iconSize.md,
    marginRight: std.gap.lg,
  },
  callIconHolding: {
    fontFamily: std.font.icon,
    fontSize: std.iconSize.md,
    color: std.color.shade4,
    width: std.iconSize.md,
    marginRight: std.gap.lg,
  },
  callIconParking: {
    fontFamily: std.font.icon,
    fontSize: std.iconSize.md,
    color: std.color.shade4,
    width: std.iconSize.md,
    marginRight: std.gap.lg,
  },
  callInfo: {
    flex: 1,
  },
  callStatus: {
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
  actionIcon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipText: {
    fontFamily: std.font.text,
    fontSize: std.textSize.sm,
    textAlign: 'center',
    color: std.color.shade5,
  },
};

const Navbar = p => (
  <View style={st.navbar}>
    <Button style={st.navbarLeftOpt} onPress={p.browseHistory}>
      <Text style={st.navbarOptText}>Recent</Text>
    </Button>
    <Text style={st.navbarTitle}>Calls</Text>
    <Button style={st.navbarRightOpt} onPress={p.create}>
      <Text style={st.navbarOptText}>Dial</Text>
    </Button>
  </View>
);

const Control = p => (
  <View style={st.control}>
    <View style={st.controlCall}>
      {!p.answered && p.incoming && (
        <Text style={st.callStatus}>Ringing by</Text>
      )}
      {!p.answered && !p.incoming && (
        <Text style={st.callStatus}>Calling to</Text>
      )}
      {p.answered && p.holding && <Text style={st.callStatus}>Holding on</Text>}
      {p.answered && !p.holding && (
        <Text style={st.callStatus}>Talking to</Text>
      )}
      <Text style={st.callName}>{p.partyName || p.partyNumber}</Text>
      <Text style={st.callNumber}>{p.partyNumber}</Text>
    </View>
    <View style={st.controlOpts}>
      {!p.holding && (
        <View style={st.actionIcon}>
          <Button style={st.controlOpt} onPress={p.hangup}>
            <Text style={st.optIconDanger}>icon_phone_hang</Text>
          </Button>
          <Text style={st.tipText} onPress={p.hangup}>
            Hangup
          </Text>
        </View>
      )}
      {p.incoming && !p.answered && (
        <View style={st.actionIcon}>
          <Button style={st.controlOpt} onPress={p.answer}>
            <Text style={st.optIconAction}>icon_phone_pick</Text>
          </Button>
          <Text style={st.tipText} onPress={p.answer}>
            Answer
          </Text>
        </View>
      )}
      {p.answered && p.holding && (
        <View style={st.actionIcon}>
          <Button style={st.controlOpt} onPress={p.unhold}>
            <Text style={st.optIconAction}>icon_play</Text>
          </Button>
          <Text style={st.tipText} onPress={p.unhold}>
            Unhold
          </Text>
        </View>
      )}
      {p.answered && !p.holding && (
        <View style={st.actionIcon}>
          <Button style={st.controlOpt} onPress={p.transfer}>
            <Text style={st.optIconAction}>icon_phone_forwarded</Text>
          </Button>
          <Text style={st.tipText} onPress={p.transfer}>
            Transfer
          </Text>
        </View>
      )}
      {p.answered && !p.holding && (
        <View style={st.actionIcon}>
          <Button style={st.controlOpt} onPress={p.park}>
            <Text style={st.optIconAction}>icon_map_pin</Text>
          </Button>
          <Text style={st.tipText} onPress={p.park}>
            Park
          </Text>
        </View>
      )}
      {p.answered && !p.holding && p.localVideoEnabled && (
        <View style={st.actionIcon}>
          <Button style={st.controlOpt} onPress={p.disableVideo}>
            <Text style={st.optIconDanger}>icon_video_off</Text>
          </Button>
          <Text style={st.tipText} onPress={p.disableVideo}>
            Video
          </Text>
        </View>
      )}
      {p.answered && !p.holding && !p.localVideoEnabled && (
        <View style={st.actionIcon}>
          <Button style={st.controlOpt} onPress={p.enableVideo}>
            <Text style={st.optIconAction}>icon_video_on</Text>
          </Button>
          <Text style={st.tipText} onPress={p.enableVideo}>
            Video
          </Text>
        </View>
      )}
      {p.answered && !p.holding && !p.recording && (
        <View style={st.actionIcon}>
          <Button style={st.controlOpt} onPress={p.startRecording}>
            <Text style={st.optIconAction}>icon_disc</Text>
          </Button>
          <Text style={st.tipText} onPress={p.startRecording}>
            Recording
          </Text>
        </View>
      )}
      {p.answered && !p.holding && p.recording && (
        <View style={st.actionIcon}>
          <Button style={st.controlOpt} onPress={p.stopRecording}>
            <Text style={st.optIconDanger}>icon_stop_circle</Text>
          </Button>
          <Text style={st.tipText} onPress={p.stopRecording}>
            Recording
          </Text>
        </View>
      )}
      {p.answered && !p.holding && (
        <View style={st.actionIcon}>
          <Button style={st.controlOpt} onPress={p.dtmf}>
            <Text style={st.optIconAction}>icon_keypad</Text>
          </Button>
          <Text style={st.tipText} onPress={p.dtmf}>
            Keypad
          </Text>
        </View>
      )}
      {p.answered && !p.holding && !p.loudspeaker && Platform.OS !== 'web' && (
        <View style={st.actionIcon}>
          <Button style={st.controlOpt} onPress={p.onOpenLoudSpeaker}>
            <Text style={st.optIconAction}>icon_volume_2</Text>
          </Button>
          <Text style={st.tipText} onPress={p.onOpenLoudSpeaker}>
            Loud
          </Text>
        </View>
      )}
      {p.answered && !p.holding && p.loudspeaker && Platform.OS !== 'web' && (
        <View style={st.actionIcon}>
          <Button style={st.controlOpt} onPress={p.onCloseLoudSpeaker}>
            <Text style={st.optIconAction}>icon_volume_1</Text>
          </Button>
          <Text style={st.tipText} onPress={p.onCloseLoudSpeaker}>
            Normal
          </Text>
        </View>
      )}
      {p.answered && !p.holding && (
        <View style={st.actionIcon}>
          <Button style={st.controlOpt} onPress={p.hold}>
            <Text style={st.optIconAction}>icon_pause</Text>
          </Button>
          <Text style={st.tipText} onPress={p.hold}>
            Hold
          </Text>
        </View>
      )}
    </View>
  </View>
);

const ControlPlaceholder = p => (
  <View style={st.control}>
    <View style={st.controlCall}>
      <View style={st.callStatusPlaceholder} />
      <View style={st.callNamePlaceholder} />
      <View style={st.callNumberPlaceholder} />
    </View>
    <View style={st.controlOpts}>
      <View style={st.controlOpt} />
      <View style={st.controlOpt} />
      <View style={st.controlOpt} />
      <View style={st.controlOpt} />
      <View style={st.controlOpt} />
    </View>
  </View>
);

const RunningItem = p => (
  <Button style={st.call} onPress={p.select} disabled={p.selected}>
    {p.selected && <View style={st.callSelected} />}
    {!p.answered && p.incoming && (
      <Text style={st.callIconIncoming}>icon_phone_incoming</Text>
    )}
    {!p.answered && !p.incoming && (
      <Text style={st.callIconOutgoing}>icon_phone_outgoing</Text>
    )}
    {p.answered && p.holding && (
      <Text style={st.callIconHolding}>icon_phone_pause</Text>
    )}
    {p.answered && !p.holding && (
      <Text style={st.callIconTalking}>icon_phone_call</Text>
    )}
    <View style={st.callInfo}>
      <Text style={st.callName}>{p.partyName || p.partyNumber}</Text>
      <Text style={st.callNumber}>{p.partyNumber}</Text>
    </View>
  </Button>
);

const RunningList = p => (
  <View style={st.callList}>
    {p.ids.map(id => (
      <RunningItem
        {...p.byid[id]}
        key={id}
        selected={id === p.selectedId}
        select={() => p.select(p.byid[id])}
      />
    ))}
  </View>
);

const ParkingItem = p => (
  <View style={st.call}>
    <Text style={st.callIconParking}>icon_map_pin</Text>
    <View style={st.callInfo}>
      <Text style={st.callName}>{p.id}</Text>
    </View>
    <Button style={st.callOpt} onPress={p.unpark}>
      <Text style={st.optIconAction}>icon_phone_pick</Text>
    </Button>
  </View>
);

const ParkingList = p => (
  <View style={st.callList}>
    {p.ids.map(id => (
      <ParkingItem key={id} id={id} unpark={() => p.unpark(id)} />
    ))}
  </View>
);

const CallsManage = p => (
  <View style={st.main}>
    <Navbar browseHistory={p.browseHistory} create={p.create} />
    {p.runningById[p.selectedId] ? (
      <Control
        {...p.runningById[p.selectedId]}
        hangup={p.hangup}
        answer={p.answer}
        hold={p.hold}
        unhold={p.unhold}
        startRecording={p.startRecording}
        stopRecording={p.stopRecording}
        transfer={p.transfer}
        dtmf={p.dtmf}
        park={p.park}
        enableVideo={p.enableVideo}
        disableVideo={p.disableVideo}
        onOpenLoudSpeaker={p.onOpenLoudSpeaker}
        onCloseLoudSpeaker={p.onCloseLoudSpeaker}
      />
    ) : (
      <ControlPlaceholder />
    )}
    <ScrollView style={st.main}>
      <RunningList
        ids={p.runningIds}
        byid={p.runningById}
        selectedId={p.selectedId}
        select={p.select}
      />
      <ParkingList ids={p.parkingIds} unpark={p.unpark} />
    </ScrollView>
  </View>
);

export default CallsManage;
