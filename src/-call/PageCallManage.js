import {
  mdiAlphaPCircle,
  mdiCallSplit,
  mdiDialpad,
  mdiMicrophone,
  mdiMicrophoneOff,
  mdiPauseCircle,
  mdiPhoneHangup,
  mdiRecord,
  mdiRecordCircle,
  mdiVideo,
  mdiVideoOff,
  mdiVolumeHigh,
  mdiVolumeMedium,
} from '@mdi/js';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import { Platform, StyleSheet, TouchableOpacity, View } from '../-/Rn';
import g from '../global';
import callStore from '../global/callStore';
import intl from '../intl/intl';
import BrekekeGradient from '../shared/BrekekeGradient';
import ButtonIcon from '../shared/ButtonIcon';
import FieldButton from '../shared/FieldButton';
import Layout from '../shared/Layout';
import VideoPlayer from '../shared/VideoPlayer';
import renderBackgroundCalls from './renderBackgroundCalls';

const css = StyleSheet.create({
  Video: {
    position: `absolute`,
    top: 40, // Header compact height
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: `black`,
  },
  VideoSpace: {
    flex: 1,
    alignSelf: `stretch`,
  },

  Btns: {
    position: `absolute`,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 112, // Hangup button
  },
  Btns__isVideoEnabled: {
    backgroundColor: g.layerBg,
  },
  BtnsInner: {
    flexDirection: `row`,
    alignSelf: `center`,
  },
  BtnsInnerSpace: {
    height: 20,
  },
  BtnsInnerMarginVertical: {
    flex: 1,
  },

  HangupBtn: {
    position: `absolute`,
    bottom: 30,
    left: 0,
    right: 0,
  },
});

@observer
class PageCallManage extends React.Component {
  @observable showButtonsInVideoCall = true;
  alreadySetShowButtonsInVideoCall = false;

  componentDidMount() {
    this.hideButtonsIfVideo();
  }
  componentDidUpdate() {
    this.hideButtonsIfVideo();
    if (!callStore.currentCall && !callStore.backgroundCalls.length) {
      g.backToPageCallRecents();
    }
  }

  @action toggleButtons = () => {
    this.showButtonsInVideoCall = !this.showButtonsInVideoCall;
  };
  @action hideButtonsIfVideo = () => {
    if (
      !this.props.isFromCallBar &&
      !this.alreadySetShowButtonsInVideoCall &&
      callStore.currentCall?.remoteVideoEnabled
    ) {
      this.showButtonsInVideoCall = false;
      this.alreadySetShowButtonsInVideoCall = true;
    }
  };

  renderCall = (c, isVideoEnabled) => {
    const fn = callStore.isViewBackgroundCalls
      ? renderBackgroundCalls
      : !c
      ? () => null
      : c.holding
      ? this.renderHoldingCall
      : c.transferring
      ? this.renderTransferringCall
      : c.parking
      ? this.renderParkingCall
      : c.isDTMF
      ? this.renderDTMF
      : this.renderCommonCall;
    return fn(c, isVideoEnabled);
  };

  renderCommonCall = (c, isVideoEnabled) => {
    let dropdown =
      isVideoEnabled && !c.holding && !c.transparent && !c.parking
        ? [
            {
              label: this.showButtonsInVideoCall
                ? intl`Hide call menu buttons`
                : intl`Show call menu buttons`,
              onPress: this.toggleButtons,
            },
          ]
        : null;
    return (
      <Layout
        compact
        dropdown={dropdown}
        noScroll
        onBack={g.backToPageCallRecents}
        title={c?.title || intl`Connection failed`}
      >
        {isVideoEnabled && this.renderVideo(c)}
        {c.answered && this.renderBtns(c, isVideoEnabled)}
        {this.renderHangupBtn(c)}
      </Layout>
    );
  };
  renderVideo = c => (
    <React.Fragment>
      <View style={css.VideoSpace} />
      <View style={css.Video}>
        <VideoPlayer sourceObject={c.remoteVideoStreamObject} />
      </View>
      <TouchableOpacity
        onPress={this.toggleButtons}
        style={StyleSheet.absoluteFill}
      />
    </React.Fragment>
  );
  renderBtns = (c, isVideoEnabled) => {
    if (isVideoEnabled && !this.showButtonsInVideoCall) {
      return null;
    }
    const Container = isVideoEnabled ? TouchableOpacity : View;
    const activeColor = isVideoEnabled ? g.colors.primary : g.colors.warning;
    const n = callStore.backgroundCalls.length;
    return (
      <Container
        onPress={isVideoEnabled ? this.toggleButtons : null}
        style={[css.Btns, isVideoEnabled && css.Btns__isVideoEnabled]}
      >
        <View style={css.BtnsInnerMarginVertical} />
        <View style={css.BtnsInner}>
          <ButtonIcon
            bgcolor="white"
            color="black"
            name={intl`TRANSFER`}
            noborder
            onPress={c.initTransferring}
            path={mdiCallSplit}
            size={40}
            textcolor="white"
          />
          <ButtonIcon
            bgcolor="white"
            color="black"
            name={intl`PARK`}
            noborder
            onPress={c.park}
            path={mdiAlphaPCircle}
            size={40}
            textcolor="white"
          />
          <ButtonIcon
            bgcolor={c.localVideoEnabled ? activeColor : `white`}
            color={c.localVideoEnabled ? `white` : `black`}
            name={intl`VIDEO`}
            noborder
            onPress={c.localVideoEnabled ? c.disableVideo : c.enableVideo}
            path={c.localVideoEnabled ? mdiVideo : mdiVideoOff}
            size={40}
            textcolor="white"
          />
          {Platform.OS !== `web` && (
            <ButtonIcon
              bgcolor={callStore.isLoudSpeakerEnabled ? activeColor : `white`}
              color={callStore.isLoudSpeakerEnabled ? `white` : `black`}
              name={intl`SPEAKER`}
              noborder
              onPress={callStore.toggleLoudSpeaker}
              path={
                callStore.isLoudSpeakerEnabled ? mdiVolumeHigh : mdiVolumeMedium
              }
              size={40}
              textcolor="white"
            />
          )}
        </View>
        <View style={css.BtnsInnerSpace} />
        <View style={css.BtnsInner}>
          <ButtonIcon
            bgcolor={c.muted ? activeColor : `white`}
            color={c.muted ? `white` : `black`}
            name={c.muted ? intl`UNMUTE` : intl`MUTE`}
            noborder
            onPress={c.toggleMuted}
            path={c.muted ? mdiMicrophoneOff : mdiMicrophone}
            size={40}
            textcolor="white"
          />
          <ButtonIcon
            bgcolor={c.recording ? activeColor : `white`}
            color={c.recording ? `white` : `black`}
            name={intl`RECORD`}
            noborder
            onPress={c.toggleRecording}
            path={c.recording ? mdiRecordCircle : mdiRecord}
            size={40}
            textcolor="white"
          />
          <ButtonIcon
            bgcolor="white"
            color="black"
            name={intl`DTMF`}
            noborder
            onPress={c.toggleDTMF}
            path={mdiDialpad}
            size={40}
            textcolor="white"
          />
          <ButtonIcon
            bgcolor="white"
            color="black"
            name={intl`HOLD`}
            noborder
            onPress={c.toggleHold}
            path={mdiPauseCircle}
            size={40}
            textcolor="white"
          />
        </View>
        {n > 0 && (
          <FieldButton
            label={intl`BACKGROUND CALLS`}
            onCreateBtnPress={callStore.toggleViewBackgroundCalls}
            value={intl`${n} other calls are in background`}
          />
        )}
        <View style={css.BtnsInnerMarginVertical} />
      </Container>
    );
  };
  renderHangupBtn = c => (
    <View style={css.HangupBtn}>
      <ButtonIcon
        bgcolor={g.colors.danger}
        color="white"
        noborder
        onPress={c.hangup}
        path={mdiPhoneHangup}
        size={40}
        textcolor="white"
      />
    </View>
  );

  render() {
    const c = callStore.currentCall;
    const isVideoEnabled = c?.remoteVideoEnabled && c?.localVideoEnabled;
    const Container = isVideoEnabled ? React.Fragment : BrekekeGradient;
    return <Container>{this.renderCall(c, isVideoEnabled)}</Container>;
  }
}

export default PageCallManage;
