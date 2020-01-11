import { mdiPhoneHangup } from '@mdi/js';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { Platform } from 'react-native';

import { StyleSheet, TouchableOpacity, View } from '../-/Rn';
import pbx from '../api/pbx';
import sip from '../api/sip';
import g from '../global';
import callStore from '../global/callStore';
import IncallManager from '../native/IncallManager';
import BrekekeGradient from '../shared/BrekekeGradient';
import ButtonIcon from '../shared/ButtonIcon';
import Layout from '../shared/Layout';
import VideoPlayer from '../shared/VideoPlayer';
import { arrToMap } from '../utils/toMap';
import CallManage from './CallManage';

const css = StyleSheet.create({
  PageIncoming_Btn__Hangup: {
    position: `absolute`,
    bottom: 30,
    left: 0,
    right: 0,
  },
  Space: {
    flex: 1,
    alignSelf: `stretch`,
  },
  VideoPlayer: {
    position: `absolute`,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: `black`,
  },
});

@observer
class PageCallManage extends React.Component {
  @computed get runningIds() {
    return callStore.runnings.map(c => c.id);
  }
  @computed get runningById() {
    return arrToMap(callStore.runnings, `id`, c => c);
  }
  state = {
    prevSelectedId: null,
    prevRunningIds: null,
    showButtonsInVideoCall: true,
  };

  _alreadySetShowButtonsInVideoCall = false;

  toggleButtons = () => {
    this.setState({
      showButtonsInVideoCall: !this.state.showButtonsInVideoCall,
    });
  };
  hideButtonsIfVideo = () => {
    const u = this.runningById[callStore.selectedId];
    if (!this._alreadySetShowButtonsInVideoCall && u?.remoteVideoEnabled) {
      this.setState({ showButtonsInVideoCall: false });
      this._alreadySetShowButtonsInVideoCall = true;
    }
  };

  _selectActiveCallWithRoute(props) {
    const runids = this.runningIds;
    if (runids && runids.length !== 0) {
      const activeCall = this.findActiveCallByRunids_s(runids, props);
      if (activeCall) {
        callStore.set(`selectedId`, activeCall.id);
      }
    } else {
      const parkingIds = callStore.runnings
        .filter(c => c.parking)
        .map(c => c.id);
      if (parkingIds.length !== 0) {
        // ???
      } else {
        this._checkCreatingSessionAndRoute();
      }
    }
  }

  _checkCreatingSessionAndRoute() {
    const creatingSessions = sip.getCreatingSessions();
    if (creatingSessions.isEmpty()) {
      g.goToPageCallKeypad();
    }
  }

  componentDidUpdate() {
    let runids = this.runningIds;
    const nextSelectedId = callStore.selectedId;
    if (runids && runids.length !== 0) {
      const isSelectedIdInactive = runids.indexOf(nextSelectedId) === -1;
      if (!nextSelectedId || isSelectedIdInactive) {
        const call = this.findNewestCallByRunids_s(runids, this.props);
        if (call.id) {
          callStore.set(`selectedId`, call.id);
        } else {
          g.goToPageCallRecents();
        }
      }
    } else {
      this._checkCreatingSessionAndRoute();
    }
    this.hideButtonsIfVideo();
  }

  findNewestCallByRunids_s(runids, props) {
    if (!runids || runids.length === 0) {
      return null;
    }
    let latestCall = null;
    for (let i = 0; i < runids.length; i++) {
      const runid = runids[i];
      const call = this.runningById[runid];
      if (!latestCall) {
        latestCall = call;
      } else {
        if (call.createdAt > latestCall.createdAt || !latestCall.createdAt) {
          latestCall = call;
        }
      }
    }
    return latestCall;
  }

  findActiveCallByRunids_s(runids, props) {
    if (!runids || runids.length === 0) {
      return null;
    }
    let latestCall = null;
    for (let i = 0; i < runids.length; i++) {
      const runid = runids[i];
      const call = this.runningById[runid];
      const isActiveCall = call.answered === true;
      if (isActiveCall === true) {
        if (!latestCall) {
          latestCall = call;
        } else {
          if (call.createdAt > latestCall.createdAt) {
            latestCall = call;
          }
        }
      }
    }
    return latestCall;
  }

  componentDidMount() {
    this._selectActiveCallWithRoute(this.props);
    this.hideButtonsIfVideo();
  }

  render() {
    const u = this.runningById[callStore.selectedId];
    const Container = u?.remoteVideoEnabled ? React.Fragment : BrekekeGradient;
    const containerProps = u?.remoteVideoEnabled
      ? null
      : {
          colors: [g.colors.primaryFn(0.2), g.revBg],
        };
    return (
      <Container {...containerProps}>
        <Layout
          compact
          noScroll
          onBack={g.backToPageCallRecents}
          title={u?.partyName}
          transparent={!u?.remoteVideoEnabled}
        >
          {u?.remoteVideoEnabled && (
            <React.Fragment>
              <View style={css.Space} />
              <View style={css.VideoPlayer}>
                <VideoPlayer sourceObject={u.remoteVideoStreamObject} />
              </View>
              <TouchableOpacity
                onPress={this.toggleButtons}
                style={StyleSheet.absoluteFill}
              />
            </React.Fragment>
          )}
          {(this.state.showButtonsInVideoCall || !u?.remoteVideoEnabled) && (
            <React.Fragment>
              <CallManage
                {...u}
                answer={this.answer}
                create={g.goToPageCallKeypad}
                disableVideo={this.disableVideo}
                dtmf={this.dtmf}
                enableVideo={this.enableVideo}
                hold={this.hold}
                onCloseLoudSpeaker={this.onCloseLoudSpeaker}
                onOpenLoudSpeaker={this.onOpenLoudSpeaker}
                park={this.park}
                parkingIds={callStore.runnings
                  .filter(c => c.parking)
                  .map(c => c.id)}
                setMuted={this.setMuted}
                setunMuted={this.setunMuted}
                startRecording={this.startRecording}
                stopRecording={this.stopRecording}
                toggleButtons={this.toggleButtons}
                transfer={this.transfer}
                unhold={this.unhold}
                unpark={this.unpark}
              />
              <View style={css.PageIncoming_Btn__Hangup}>
                <ButtonIcon
                  bgcolor={g.colors.danger}
                  color={g.revColor}
                  noborder
                  onPress={this.hangup}
                  path={mdiPhoneHangup}
                  size={40}
                  textcolor={g.revColor}
                />
              </View>
            </React.Fragment>
          )}
        </Layout>
      </Container>
    );
  }

  setMuted = () => {
    sip.setMuted(true, callStore.selectedId);
    callStore.upsertRunning({
      id: callStore.selectedId,
      muted: true,
    });
  };
  setunMuted = () => {
    sip.setMuted(false, callStore.selectedId);
    callStore.upsertRunning({
      id: callStore.selectedId,
      muted: false,
    });
  };
  onOpenLoudSpeaker = () => {
    if (Platform.OS !== `web`) {
      IncallManager.setForceSpeakerphoneOn(true);
    }
    callStore.upsertRunning({
      id: callStore.selectedId,
      loudspeaker: true,
    });
  };
  onCloseLoudSpeaker = () => {
    if (Platform.OS !== `web`) {
      IncallManager.setForceSpeakerphoneOn(false);
    }
    callStore.upsertRunning({
      id: callStore.selectedId,
      loudspeaker: false,
    });
  };

  hangup = () => {
    sip.hangupSession(callStore.selectedId);
    g.goToPageCallRecents();
  };
  answer = () => {
    sip.answerSession(callStore.selectedId);
  };

  hold = () => {
    const call = this.runningById[callStore.selectedId];
    pbx
      .holdTalker(call.pbxTenant, call.pbxTalkerId)
      .then(this.onHoldSuccess)
      .catch(this.onHoldFailure);
  };
  onHoldSuccess = () => {
    callStore.upsertRunning({
      id: callStore.selectedId,
      holding: true,
    });
  };
  onHoldFailure = err => {
    g.showError({ message: `Failed to hold the call`, err });
  };
  unhold = () => {
    const call = this.runningById[callStore.selectedId];
    pbx
      .unholdTalker(call.pbxTenant, call.pbxTalkerId)
      .then(this.onUnholdSuccess)
      .catch(this.onUnholdFailure);
  };
  onUnholdSuccess = () => {
    callStore.upsertRunning({
      id: callStore.selectedId,
      holding: false,
    });
  };
  onUnholdFailure = err => {
    g.showError({ message: `Failed to unhold the call`, err });
  };

  startRecording = () => {
    const call = this.runningById[callStore.selectedId];
    pbx
      .startRecordingTalker(call.pbxTenant, call.pbxTalkerId)
      .then(this.onStartRecordingSuccess)
      .catch(this.onStartRecordingFailure);
  };
  onStartRecordingSuccess = () => {
    callStore.upsertRunning({
      id: callStore.selectedId,
      recording: true,
    });
  };
  onStartRecordingFailure = err => {
    g.showError({ message: `Failed to start recording the call`, err });
  };

  stopRecording = () => {
    const call = this.runningById[callStore.selectedId];
    pbx
      .stopRecordingTalker(call.pbxTenant, call.pbxTalkerId)
      .then(this.onStopRecordingSuccess)
      .catch(this.onStopRecordingFailure);
  };
  onStopRecordingSuccess = () => {
    callStore.upsertRunning({
      id: callStore.selectedId,
      recording: false,
    });
  };
  onStopRecordingFailure = err => {
    g.showError({ message: `Failed to stop recording the call`, err });
  };

  transfer = () => {
    const call = this.runningById[callStore.selectedId];

    if (call.transfering) {
      g.goToPageTransferAttend({ callId: call.id });
    } else {
      g.goToPageTransferDial({ callId: call.id });
    }
  };
  dtmf = () => {
    const call = this.runningById[callStore.selectedId];
    g.goToPageCallKeypad(call.id);
  };
  unpark = parkNumber => {
    sip.createSession(parkNumber);
  };
  park = () => {
    g.goToPageCallParks({ screen: `call_manage` });
  };
  enableVideo = () => {
    sip.enableVideo(callStore.selectedId);
  };
  disableVideo = () => {
    sip.disableVideo(callStore.selectedId);
  };
}

export default PageCallManage;
