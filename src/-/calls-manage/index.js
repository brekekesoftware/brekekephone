import { computed } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import g from '../../global';
import arrToMap from '../arrToMap';
import callStore from '../callStore';
import PageCalling from '../components-Incoming/PageCalling';
import LoudSpeaker from '../LoudSpeaker';
import Toast from '../Toast';

@observer
class View extends React.Component {
  @computed get runningIds() {
    return callStore.runnings.map(c => c.id);
  }
  @computed get runningById() {
    return arrToMap(callStore.runnings, 'id', c => c);
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
        callStore.set('selectedId', activeCall);
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
        callStore.set('selectedId', call);
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
        if (call.createdAt > latestCall.createdAt) {
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
    return (
      <PageCalling
        selectedId={callStore.selectedId}
        runningIds={this.runningIds}
        runningById={this.runningById}
        parkingIds={callStore.runnings.filter(c => c.parking).map(c => c.id)}
        browseHistory={g.goToCallsRecent}
        create={g.goToCallsCreate}
        select={callStore.setF('selectedId')}
        hangup={this.hangup}
        answer={this.answer}
        hold={this.hold}
        unhold={this.unhold}
        startRecording={this.startRecording}
        stopRecording={this.stopRecording}
        transfer={this.transfer}
        dtmf={this.dtmf}
        unpark={this.unpark}
        park={this.park}
        enableVideo={this.enableVideo}
        disableVideo={this.disableVideo}
        onOpenLoudSpeaker={this.onOpenLoudSpeaker}
        onCloseLoudSpeaker={this.onCloseLoudSpeaker}
      />
    );
  }

  onOpenLoudSpeaker = () => {
    LoudSpeaker.open(true);

    callStore.upsertRunning({
      id: callStore.selectedId,
      loudspeaker: true,
    });
  };

  onCloseLoudSpeaker = () => {
    LoudSpeaker.open(false);

    callStore.upsertRunning({
      id: callStore.selectedId,
      loudspeaker: false,
    });
  };

  hangup = () => {
    const { sip } = this.context;

    sip.hangupSession(callStore.selectedId);
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
      .then(this.onHoldSuccess, this.onHoldFailure);
  };

  onHoldSuccess = () => {
    callStore.upsertRunning({
      id: callStore.selectedId,
      holding: true,
    });
  };

  onHoldFailure = err => {
    console.error(err);
    Toast.error('Failed to hold the call');
  };

  unhold = () => {
    const { pbx } = this.context;

    const call = this.runningById[callStore.selectedId];
    pbx
      .unholdTalker(call.pbxTenant, call.pbxTalkerId)
      .then(this.onUnholdSuccess, this.onUnholdFailure);
  };

  onUnholdSuccess = () => {
    callStore.upsertRunning({
      id: callStore.selectedId,
      holding: false,
    });
  };

  onUnholdFailure = err => {
    console.error(err);
    Toast.error('Failed to unhold the call');
  };

  startRecording = () => {
    const { pbx } = this.context;

    const call = this.runningById[callStore.selectedId];
    pbx
      .startRecordingTalker(call.pbxTenant, call.pbxTalkerId)
      .then(this.onStartRecordingSuccess, this.onStartRecordingFailure);
  };

  onStartRecordingSuccess = () => {
    callStore.upsertRunning({
      id: callStore.selectedId,
      recording: true,
    });
  };

  onStartRecordingFailure = err => {
    console.error(err);
    Toast.error('Failed to start recording the call');
  };

  stopRecording = () => {
    const { pbx } = this.context;

    const call = this.runningById[callStore.selectedId];
    pbx
      .stopRecordingTalker(call.pbxTenant, call.pbxTalkerId)
      .then(this.onStopRecordingSuccess, this.onStopRecordingFailure);
  };

  onStopRecordingSuccess = () => {
    callStore.upsertRunning({
      id: callStore.selectedId,
      recording: false,
    });
  };

  onStopRecordingFailure = err => {
    console.error(err);
    Toast.error('Failed to stop recording the call');
  };

  transfer = () => {
    const call = this.runningById[callStore.selectedId];

    if (call.transfering) {
      g.goToCallTransferAttend(call.id);
    } else {
      g.goToCallTransferDial(call.id);
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
    const call = this.runningById[callStore.selectedId];
    g.goToCallPark(call.id);
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

export default View;
