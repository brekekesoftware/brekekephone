import {
  mdiAlphaPCircle,
  mdiCallSplit,
  mdiDialpad,
  mdiKeyboardBackspace,
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
import { observer } from 'mobx-react';
import React from 'react';
import { Platform, TouchableOpacity } from 'react-native';

import { StyleSheet, View } from '../-/Rn';
import g from '../global';
import callStore from '../global/callStore';
import intl from '../intl/intl';
import ButtonIcon from '../shared/ButtonIcon';
import Field from '../shared/Field';

const css = StyleSheet.create({
  Buttons: {
    position: `absolute`,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  Buttons__hasBackground: {
    backgroundColor: g.layerBg,
  },
  CallBar_Btn: {
    flexDirection: `row`,
    alignSelf: `center`,
  },
  CallBar_Btn__margin: {
    marginBottom: 20,
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
  Space: {
    flex: 1,
  },
  Space200: {
    height: 112,
  },
  OtherCall: {
    alignSelf: `center`,
    marginTop: 15,
    paddingHorizontal: 10,
    width: 305,
    backgroundColor: `white`,
    borderRadius: g.borderRadius,
    overflow: `hidden`,
  },
  OtherCall_Inner: {
    top: -5,
    ...Platform.select({
      android: {
        top: 1,
      },
    }),
  },
  OtherCall_Btn: {
    top: 15,
    ...Platform.select({
      android: {
        top: 8,
      },
    }),
  },
  OtherCall_BtnIcon: {
    transform: [
      {
        rotate: `180deg`,
      },
    ],
  },
});

const CallManage = observer(p => {
  const Container = p.toggleButtons ? TouchableOpacity : View;
  const otherCalls = callStore.runnings.length - 1;
  return (
    <Container
      onPress={p.toggleButtons}
      style={[css.Buttons, p.toggleButtons && css.Buttons__hasBackground]}
    >
      <View style={css.Space} />
      <View style={[css.CallBar_Btn, css.CallBar_Btn__margin]}>
        {p.answered && !p.holding && (
          <ButtonIcon
            bgcolor={g.revColor}
            color={g.color}
            name={intl`TRANSFER`}
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
            name={intl`PARK`}
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
            name={intl`VIDEO`}
            noborder
            onPress={p.enableVideo}
            path={mdiVideo}
            size={40}
            textcolor={g.revColor}
          />
        )}
        {p.answered && !p.holding && p.localVideoEnabled && (
          <ButtonIcon
            bgcolor={p.toggleButtons ? g.colors.primary : g.colors.warning}
            color="white"
            name={intl`VIDEO`}
            noborder
            onPress={p.disableVideo}
            path={mdiVideoOff}
            size={40}
            textcolor={g.revColor}
          />
        )}
        {p.answered &&
          !p.holding &&
          !p.loudspeaker &&
          Platform.OS !== `web` && (
            <ButtonIcon
              bgcolor={g.revColor}
              color={g.color}
              name={intl`SPEAKER`}
              noborder
              onPress={p.onOpenLoudSpeaker}
              path={mdiVolumeHigh}
              size={40}
              textcolor={g.revColor}
            />
          )}
        {p.answered && !p.holding && p.loudspeaker && Platform.OS !== `web` && (
          <ButtonIcon
            bgcolor={p.toggleButtons ? g.colors.primary : g.colors.warning}
            color="white"
            name={intl`SPEAKER`}
            noborder
            onPress={p.onCloseLoudSpeaker}
            path={mdiVolumeMedium}
            size={40}
            textcolor={g.revColor}
          />
        )}
      </View>
      <View style={css.CallBar_Btn}>
        {p.answered && !p.holding && !p.muted && (
          <ButtonIcon
            bgcolor={g.revColor}
            color={g.color}
            name={intl`MUTE`}
            noborder
            onPress={p.setMuted}
            path={mdiMicrophoneOff}
            size={40}
            textcolor={g.revColor}
          />
        )}
        {p.answered && !p.holding && p.muted && (
          <ButtonIcon
            bgcolor={p.toggleButtons ? g.colors.primary : g.colors.warning}
            color="white"
            name={intl`UNMUTE`}
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
            name={intl`RECORD`}
            noborder
            onPress={p.startRecording}
            path={mdiRecordCircle}
            size={40}
            textcolor={g.revColor}
          />
        )}
        {p.answered && !p.holding && p.recording && (
          <ButtonIcon
            bgcolor={p.toggleButtons ? g.colors.primary : g.colors.warning}
            color="white"
            name={intl`RECORDING`}
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
            name={intl`KEYPAD`}
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
            name={intl`HOLD`}
            noborder
            onPress={p.hold}
            path={mdiPauseCircle}
            size={40}
            textcolor={g.revColor}
          />
        )}
        {p.answered && p.holding && (
          <ButtonIcon
            bgcolor={p.toggleButtons ? g.colors.primary : g.colors.warning}
            color="white"
            name={intl`UNHOLD`}
            noborder
            onPress={p.unhold}
            path={mdiPlayCircle}
            size={40}
            textcolor={g.revColor}
          />
        )}
      </View>
      {p.answered && !p.holding && otherCalls > 0 && (
        <TouchableOpacity onPress={g.goToPageCallOthers} style={css.OtherCall}>
          <View style={css.OtherCall_Inner}>
            <Field
              createBtnIcon={mdiKeyboardBackspace}
              createBtnIconStyle={css.OtherCall_BtnIcon}
              createBtnStyle={css.OtherCall_Btn}
              label={intl`BACKGROUND CALLS`}
              onCreateBtnPress={g.goToPageCallOthers}
              transparent
              value={intl`${otherCalls} other calls are in background`}
            />
          </View>
        </TouchableOpacity>
      )}
      <View style={css.Space} />
      <View style={css.Space200} />
    </Container>
  );
});

export default CallManage;
