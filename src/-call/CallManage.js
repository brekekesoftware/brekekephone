import {
  mdiAlphaPCircle,
  mdiCallSplit,
  mdiDialpad,
  mdiMicrophone,
  mdiMicrophoneOff,
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

import { StyleSheet, View } from '../-/Rn';
import g from '../global';
import ButtonIcon from '../shared/ButtonIcon';

const css = StyleSheet.create({
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
    fontSize: g.fontSizeTitle,
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
    <View style={[css.CallBar_Btn, css.CallBar_Btn__top70]}>
      {p.answered && !p.holding && (
        <ButtonIcon
          bgcolor={g.revColor}
          color={g.color}
          name="TRANSFER"
          noborder
          onPress={p.transfer}
          path={mdiCallSplit}
          size={40}
          textcolor={g.revColor}
        />
      )}
      {p.answered && !p.holding && (
        <ButtonIcon
          bgcolor={g.revColor}
          color={g.color}
          name="PARK"
          noborder
          onPress={p.park}
          path={mdiAlphaPCircle}
          size={40}
          textcolor={g.revColor}
        />
      )}
      {p.answered && !p.holding && !p.localVideoEnabled && (
        <ButtonIcon
          bgcolor={g.revColor}
          color={g.color}
          name="VIDEO"
          noborder
          onPress={p.enableVideo}
          path={mdiVideo}
          size={40}
          textcolor={g.revColor}
        />
      )}
      {p.answered && !p.holding && p.localVideoEnabled && (
        <ButtonIcon
          bgcolor={g.revColor}
          color={g.color}
          name="VIDEO"
          noborder
          onPress={p.disableVideo}
          path={mdiVideoOff}
          size={40}
          textcolor={g.revColor}
        />
      )}
      {p.answered && !p.holding && !p.loudspeaker && Platform.OS !== `web` && (
        <ButtonIcon
          bgcolor={g.revColor}
          color={g.color}
          name="SPEAKER"
          noborder
          onPress={p.onOpenLoudSpeaker}
          path={mdiVolumeHigh}
          size={40}
          textcolor={g.revColor}
        />
      )}
      {p.answered && !p.holding && p.loudspeaker && Platform.OS !== `web` && (
        <ButtonIcon
          bgcolor={g.revColor}
          color={g.color}
          name="SPEAKER"
          noborder
          onPress={p.onCloseLoudSpeaker}
          path={mdiVolumeMedium}
          size={40}
          textcolor={g.revColor}
        />
      )}
    </View>
    <View style={[css.CallBar_Btn, css.CallBar_Btn__top150]}>
      {p.answered && !p.holding && !p.muted && (
        <ButtonIcon
          bgcolor={g.revColor}
          color={g.color}
          name="MUTE"
          noborder
          onPress={p.setMuted}
          path={mdiMicrophoneOff}
          size={40}
          textcolor={g.revColor}
        />
      )}
      {p.answered && !p.holding && p.muted && (
        <ButtonIcon
          bgcolor={g.revColor}
          color={g.color}
          name="UNMUTE"
          noborder
          onPress={p.setunMuted}
          path={mdiMicrophone}
          size={40}
          textcolor={g.revColor}
        />
      )}
      {p.answered && !p.holding && !p.recording && (
        <ButtonIcon
          bgcolor={g.revColor}
          color={g.color}
          name="RECORDING"
          noborder
          onPress={p.startRecording}
          path={mdiRecordCircle}
          size={40}
          textcolor={g.revColor}
        />
      )}
      {p.answered && !p.holding && p.recording && (
        <ButtonIcon
          bgcolor={g.revColor}
          color={g.color}
          name="RECORDING"
          noborder
          onPress={p.stopRecording}
          path={mdiRecord}
          size={40}
          textcolor={g.revColor}
        />
      )}
      {p.answered && !p.holding && (
        <ButtonIcon
          bgcolor={g.revColor}
          color={g.color}
          name="KEYPAD"
          noborder
          onPress={p.dtmf}
          path={mdiDialpad}
          size={40}
          textcolor={g.revColor}
        />
      )}
      {p.answered && !p.holding && (
        <ButtonIcon
          bgcolor={g.revColor}
          color={g.color}
          name="HOLD"
          noborder
          onPress={p.hold}
          path={mdiPauseCircle}
          size={40}
          textcolor={g.revColor}
        />
      )}
      {p.answered && p.holding && (
        <ButtonIcon
          bgcolor={g.revColor}
          color={g.color}
          name="UNHOLD"
          noborder
          onPress={p.unhold}
          path={mdiPlayCircle}
          size={40}
          textcolor={g.revColor}
        />
      )}
    </View>
  </View>
);

export default CallManage;
