import { mdiPhoneHangup } from '@mdi/js';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import { Platform } from 'react-native';

import callStore from '../-/callStore';
import g from '../global';
import IncallManager from '../native/IncallManager';
import { StyleSheet, View } from '../native/Rn';
import BrekekeGradient from '../shared/BrekekeGradient';
import ButtonIcon from '../shared/ButtonIcon';
import Layout from '../shared/Layout';
import { arrToMap } from '../utils/toMap';
import v from '../variables';
import CallManage from './CallManage';

const s = StyleSheet.create({
  PageIncoming_Btn__Hangup: {
    position: `absolute`,
    bottom: 100,
    left: 0,
    right: 0,
    marginLeft: `auto`,
    marginRight: `auto`,
  },
});

@observer
class PageIncoming extends React.Component {
  @computed get runningIds() {
    return callStore.runnings.map(c => c.id);
  }
  @computed get runningById() {
    return arrToMap(callStore.runnings, `id`, c => c);
  }
  state = {
    prevSelectedId: null,
    prevRunningIds: null,
  };

  static contextTypes = {
    sip: PropTypes.object.isRequired,
    pbx: PropTypes.object.isRequired,
  };

  _selectActiveCallWithRoute(props) {
    const runids = this.runningIds;
    if (runids && runids.length !== 0) {
      const activeCall = this.findActiveCallByRunids_s(runids, props);
      if (activeCall) {
        callStore.set(`selectedId`, activeCall);
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
    const { sip } = this.context;

    const creatingSessions = sip.getCreatingSessions();

    if (creatingSessions.isEmpty()) {
      g.goToCallsCreate();
    }
  }

  componentDidUpdate() {
    let runids = this.runningIds;
    const nextSelectedId = callStore.selectedId;
    if (runids && runids.length !== 0) {
      const isSelectedIdInactive = runids.indexOf(nextSelectedId) === -1;
      if (!nextSelectedId || isSelectedIdInactive) {
        const call = this.findNewestCallByRunids_s(runids, this.props);
        callStore.set(`selectedId`, call.id);
      }
    } else {
      this._checkCreatingSessionAndRoute();
    }
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
  }

  render() {
    const u = this.runningById[callStore.selectedId];
    return (
      <BrekekeGradient colors={[v.callBg, v.revBg]}>
        <Layout
          header={{
            transparent: true,
            onBackBtnPress: g.goToCallsRecent,
            title: u?.partyName,
            titleColor: v.revColor,
            backBtnColor: v.revColor,
          }}
          noScroll
        >
          <CallManage
            {...u}
            answer={this.answer}
            browseHistory={g.goToCallsRecent}
            create={g.goToCallsCreate}
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
            startRecording={this.startRecording}
            stopRecording={this.stopRecording}
            transfer={this.transfer}
            unhold={this.unhold}
            unpark={this.unpark}
          />
          <View style={s.PageIncoming_Btn__Hangup}>
            <ButtonIcon
              bgcolor={v.redBg}
              color={v.revColor}
              name="HANG UP"
              noborder
              onPress={this.hangup}
              path={mdiPhoneHangup}
              size={40}
              textcolor={v.revColor}
            />
          </View>
        </Layout>
      </BrekekeGradient>
    );
  }

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
    const { sip } = this.context;

    sip.hangupSession(callStore.selectedId);
    g.goToCallsRecent();
  };

  answer = () => {
    const { sip } = this.context;

    sip.answerSession(callStore.selectedId);
  };

  hold = () => {
    const { pbx } = this.context;

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
    console.error(err);
    g.showError({ message: `hold the call` });
  };

  unhold = () => {
    const { pbx } = this.context;

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
    console.error(err);
    g.showError({ message: `unhold the call` });
  };

  startRecording = () => {
    const { pbx } = this.context;

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
    console.error(err);
    g.showError({ message: `start recording the call` });
  };

  stopRecording = () => {
    const { pbx } = this.context;

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
    console.error(err);
    g.showError({ message: `stop recording the call` });
  };

  transfer = () => {
    const call = this.runningById[callStore.selectedId];

    if (call.transfering) {
      g.goToCallTransferAttend({ callId: call.id });
    } else {
      g.goToCallTransferDial({ callId: call.id });
    }
  };

  dtmf = () => {
    const call = this.runningById[callStore.selectedId];
    g.goToCallKeypad(call.id);
  };

  unpark = parkNumber => {
    const { sip } = this.context;

    sip.createSession(parkNumber);
  };

  park = () => {
    g.goToCallPark({ screen: `call_manage` });
  };

  enableVideo = () => {
    const { sip } = this.context;

    sip.enableVideo(callStore.selectedId);
  };

  disableVideo = () => {
    const { sip } = this.context;

    sip.disableVideo(callStore.selectedId);
  };
}

export default PageIncoming;
