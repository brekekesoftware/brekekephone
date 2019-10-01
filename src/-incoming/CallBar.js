import {
  mdiAlphaPCircleOutline,
  mdiCallSplit,
  mdiDialpad,
  mdiPauseCircleOutline,
  mdiPhoneHangup,
  mdiPlayCircleOutline,
  mdiRecord,
  mdiRecordCircleOutline,
  mdiVideoOffOutline,
  mdiVideoOutline,
  mdiVolumeHigh,
  mdiVolumeMedium,
} from '@mdi/js';
import React from 'react';
import { Platform } from 'react-native';

import { StyleSheet, Text, View } from '../native/Rn';
import ButtonIcon from '../shared/ButtonIcon';
import Layout from '../shared/Layout';
import v from '../variables';

const s = StyleSheet.create({
  CallBar_Btn: {
    flexDirection: `row`,
    position: `absolute`,
    alignSelf: `center`,
  },
  CallBar_Btn__top70: {
    top: 70,
  },
  CallBar_Btn__top150: {
    top: 150,
  },
  CallBar_Txt: {
    position: `absolute`,
    left: 20,
  },
  CallBar_Txt__Name: {
    fontSize: v.fontSizeTitle,
  },
  CallBar_Btn__Hangup: {
    position: `absolute`,
    bottom: 15,
    left: 0,
    right: 0,
    marginLeft: `auto`,
    marginRight: `auto`,
  },
});

const CallBar = p => (
  <Layout>
    <View style={s.CallBar_Txt}>
      <Text style={s.CallBar_Txt__Name}>Alan Walker</Text>
      <Text>00:05</Text>
    </View>
    <View style={[s.CallBar_Btn, s.CallBar_Btn__top70]}>
      {p.answered && !p.holding && (
        <ButtonIcon
          onPress={p.transfer}
          size={40}
          path={mdiCallSplit}
          name="TRANSFER"
        />
      )}
      {p.answered && !p.holding && (
        <ButtonIcon
          onPress={p.park}
          size={40}
          path={mdiAlphaPCircleOutline}
          name="PARK"
        />
      )}
      {p.answered && !p.holding && !p.localVideoEnabled && (
        <ButtonIcon
          onPress={p.enableVideo}
          size={40}
          path={mdiVideoOutline}
          name="VIDEO"
        />
      )}
      {p.answered && !p.holding && p.localVideoEnabled && (
        <ButtonIcon
          onPress={p.disableVideo}
          size={40}
          path={mdiVideoOffOutline}
          name="VIDEO"
        />
      )}
      {p.answered && !p.holding && !p.loudspeaker && Platform.OS !== `web` && (
        <ButtonIcon
          onPress={p.onOpenLoudSpeaker}
          size={40}
          path={mdiVolumeHigh}
          name="SPEAKER"
        />
      )}
      {p.answered && !p.holding && p.loudspeaker && Platform.OS !== `web` && (
        <ButtonIcon
          onPress={p.onCloseLoudSpeaker}
          size={40}
          path={mdiVolumeMedium}
          name="SPEAKER"
        />
      )}
    </View>
    <View style={[s.CallBar_Btn, s.CallBar_Btn__top150]}>
      {p.answered && !p.holding && !p.recording && (
        <ButtonIcon
          onPress={p.startRecording}
          size={40}
          path={mdiRecordCircleOutline}
          name="RECORDING"
        />
      )}
      {p.answered && !p.holding && p.recording && (
        <ButtonIcon
          onPress={p.stopRecording}
          size={40}
          path={mdiRecord}
          name="RECORDING"
        />
      )}
      {p.answered && !p.holding && (
        <ButtonIcon
          onPress={p.dtmf}
          size={40}
          path={mdiDialpad}
          name="KEYPAD"
        />
      )}
      {p.answered && !p.holding && (
        <ButtonIcon
          onPress={p.hold}
          size={40}
          path={mdiPauseCircleOutline}
          name="HOLD"
        />
      )}
      {p.answered && p.holding && (
        <ButtonIcon
          onPress={p.unhold}
          size={40}
          path={mdiPlayCircleOutline}
          name="UNHOLD"
        />
      )}
    </View>
    <View style={s.CallBar_Btn__Hangup}>
      <ButtonIcon
        onPress={p.hangup}
        size={40}
        path={mdiPhoneHangup}
        name="HANG UP"
      />
    </View>
  </Layout>
);

export default CallBar;
