import {
  mdiAlphaPCircle,
  mdiCallSplit,
  mdiDialpad,
  mdiPauseCircle,
  mdiPlayCircle,
  mdiRecord,
  mdiRecordCircle,
  mdiVideo,
  mdiVideoOff,
  mdiVolumeHigh,
  mdiVolumeMedium,
} from '@mdi/js';
import React from 'react';
import { Platform } from 'react-native';

import { StyleSheet, View } from '../native/Rn';
import ButtonIcon from '../shared/ButtonIcon';
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
    top: 165,
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

const CallManage = p => (
  <View>
    <View style={[s.CallBar_Btn, s.CallBar_Btn__top70]}>
      {p.answered && !p.holding && (
        <ButtonIcon
          onPress={p.transfer}
          size={40}
          noborder
          color={v.color}
          bgcolor={v.revColor}
          Textcolor={v.revColor}
          path={mdiCallSplit}
          name="TRANSFER"
        />
      )}
      {p.answered && !p.holding && (
        <ButtonIcon
          onPress={p.park}
          noborder
          color={v.color}
          bgcolor={v.revColor}
          Textcolor={v.revColor}
          size={40}
          path={mdiAlphaPCircle}
          name="PARK"
        />
      )}
      {p.answered && !p.holding && !p.localVideoEnabled && (
        <ButtonIcon
          onPress={p.enableVideo}
          noborder
          color={v.color}
          bgcolor={v.revColor}
          Textcolor={v.revColor}
          size={40}
          path={mdiVideo}
          name="VIDEO"
        />
      )}
      {p.answered && !p.holding && p.localVideoEnabled && (
        <ButtonIcon
          onPress={p.disableVideo}
          noborder
          color={v.color}
          bgcolor={v.revColor}
          Textcolor={v.revColor}
          size={40}
          path={mdiVideoOff}
          name="VIDEO"
        />
      )}
      {p.answered && !p.holding && !p.loudspeaker && Platform.OS !== `web` && (
        <ButtonIcon
          onPress={p.onOpenLoudSpeaker}
          noborder
          color={v.color}
          bgcolor={v.revColor}
          Textcolor={v.revColor}
          size={40}
          path={mdiVolumeHigh}
          name="SPEAKER"
        />
      )}
      {p.answered && !p.holding && p.loudspeaker && Platform.OS !== `web` && (
        <ButtonIcon
          onPress={p.onCloseLoudSpeaker}
          noborder
          color={v.color}
          bgcolor={v.revColor}
          Textcolor={v.revColor}
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
          noborder
          color={v.color}
          bgcolor={v.revColor}
          Textcolor={v.revColor}
          size={40}
          path={mdiRecordCircle}
          name="RECORDING"
        />
      )}
      {p.answered && !p.holding && p.recording && (
        <ButtonIcon
          onPress={p.stopRecording}
          noborder
          color={v.color}
          bgcolor={v.revColor}
          Textcolor={v.revColor}
          size={40}
          path={mdiRecord}
          name="RECORDING"
        />
      )}
      {p.answered && !p.holding && (
        <ButtonIcon
          onPress={p.dtmf}
          noborder
          color={v.color}
          bgcolor={v.revColor}
          Textcolor={v.revColor}
          size={40}
          path={mdiDialpad}
          name="KEYPAD"
        />
      )}
      {p.answered && !p.holding && (
        <ButtonIcon
          onPress={p.hold}
          noborder
          color={v.color}
          bgcolor={v.revColor}
          Textcolor={v.revColor}
          size={40}
          path={mdiPauseCircle}
          name="HOLD"
        />
      )}
      {p.answered && p.holding && (
        <ButtonIcon
          onPress={p.unhold}
          noborder
          color={v.color}
          bgcolor={v.revColor}
          Textcolor={v.revColor}
          size={40}
          path={mdiPlayCircle}
          name="UNHOLD"
        />
      )}
    </View>
  </View>
);

export default CallManage;
