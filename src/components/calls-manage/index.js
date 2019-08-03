import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { createModelView } from 'redux-model';

import * as routerUtils from '../../mobx/routerStore';
import LoudSpeaker from './LoudSpeaker';
import UI from './ui';
import toast from '../../nativeModules/toast';

@observer
@createModelView(
  getter => state => ({
    runningIds: getter.runningCalls.idsByOrder(state),
    runningById: getter.runningCalls.detailMapById(state),
    parkingIds: getter.parkingCalls.idsByOrder(state),
    selectedId: getter.callsManaging.selectedId(state),
  }),
  action => emit => ({
    updateCall(call) {
      emit(action.runningCalls.update(call));
    },
    selectCall(call) {
      emit(action.callsManaging.setSelectedId(call.id));
    },
  }),
)
@observer
class View extends Component {
  state = {
    prevSelectedId: null,
    prevRunningIds: null,
  };

  static contextTypes = {
    sip: PropTypes.object.isRequired,
    pbx: PropTypes.object.isRequired,
  };

  _selectActiveCallWithRoute(props) {
    const runids = props.runningIds;

    if (runids && runids.length !== 0) {
      const activeCall = this.findActiveCallByRunids_s(runids, props);

      if (activeCall) {
        this.props.selectCall(activeCall);
      }
    } else if (props.parkingIds && props.parkingIds.length !== 0) {
    } else {
      this._checkCreatingSessionAndRoute();
    }
  }

  _checkCreatingSessionAndRoute() {
    const { sip } = this.context;

    const creatingSessions = sip.getCreatingSessions();

    if (creatingSessions.isEmpty()) {
      routerUtils.goToCallsCreate();
    }
  }

  componentWillReceiveProps(nextProps) {
    let runids = nextProps.runningIds;
    const nextSelectedId = nextProps.selectedId;

    if (runids && runids.length !== 0) {
      const isSelectedIdInactive = runids.indexOf(nextSelectedId) === -1;

      if (!nextSelectedId || isSelectedIdInactive) {
        const call = this.findNewestCallByRunids_s(runids, nextProps);
        this.props.selectCall(call);
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
      const call = props.runningById[runid];

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
      const call = props.runningById[runid];
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
      <UI
        selectedId={this.props.selectedId}
        runningIds={this.props.runningIds}
        runningById={this.props.runningById}
        parkingIds={this.props.parkingIds}
        browseHistory={routerUtils.goToCallsRecent}
        create={routerUtils.goToCallsCreate}
        select={this.props.selectCall}
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

    this.props.updateCall({
      id: this.props.selectedId,
      loudspeaker: true,
    });
  };

  onCloseLoudSpeaker = () => {
    LoudSpeaker.open(false);

    this.props.updateCall({
      id: this.props.selectedId,
      loudspeaker: false,
    });
  };

  hangup = () => {
    const { sip } = this.context;

    sip.hangupSession(this.props.selectedId);
  };

  answer = () => {
    const { sip } = this.context;

    sip.answerSession(this.props.selectedId);
  };

  hold = () => {
    const { pbx } = this.context;

    const call = this.props.runningById[this.props.selectedId];
    pbx
      .holdTalker(call.pbxTenant, call.pbxTalkerId)
      .then(this.onHoldSuccess, this.onHoldFailure);
  };

  onHoldSuccess = () => {
    this.props.updateCall({
      id: this.props.selectedId,
      holding: true,
    });
  };

  onHoldFailure = err => {
    console.error(err);
    toast.error('Failed to hold the call');
  };

  unhold = () => {
    const { pbx } = this.context;

    const call = this.props.runningById[this.props.selectedId];
    pbx
      .unholdTalker(call.pbxTenant, call.pbxTalkerId)
      .then(this.onUnholdSuccess, this.onUnholdFailure);
  };

  onUnholdSuccess = () => {
    this.props.updateCall({
      id: this.props.selectedId,
      holding: false,
    });
  };

  onUnholdFailure = err => {
    console.error(err);
    toast.error('Failed to unhold the call');
  };

  startRecording = () => {
    const { pbx } = this.context;

    const call = this.props.runningById[this.props.selectedId];
    pbx
      .startRecordingTalker(call.pbxTenant, call.pbxTalkerId)
      .then(this.onStartRecordingSuccess, this.onStartRecordingFailure);
  };

  onStartRecordingSuccess = () => {
    this.props.updateCall({
      id: this.props.selectedId,
      recording: true,
    });
  };

  onStartRecordingFailure = err => {
    console.error(err);
    toast.error('Failed to start recording the call');
  };

  stopRecording = () => {
    const { pbx } = this.context;

    const call = this.props.runningById[this.props.selectedId];
    pbx
      .stopRecordingTalker(call.pbxTenant, call.pbxTalkerId)
      .then(this.onStopRecordingSuccess, this.onStopRecordingFailure);
  };

  onStopRecordingSuccess = () => {
    this.props.updateCall({
      id: this.props.selectedId,
      recording: false,
    });
  };

  onStopRecordingFailure = err => {
    console.error(err);
    toast.error('Failed to stop recording the call');
  };

  transfer = () => {
    const call = this.props.runningById[this.props.selectedId];

    if (call.transfering) {
      routerUtils.goToCallTransferAttend(call.id);
    } else {
      routerUtils.goToCallTransferDial(call.id);
    }
  };

  dtmf = () => {
    const call = this.props.runningById[this.props.selectedId];
    routerUtils.goToCallKeypad(call.id);
  };

  unpark = parkNumber => {
    const { sip } = this.context;

    sip.createSession(parkNumber);
  };

  park = () => {
    const call = this.props.runningById[this.props.selectedId];
    routerUtils.goToCallPark(call.id);
  };

  enableVideo = () => {
    const { sip } = this.context;

    sip.enableVideo(this.props.selectedId);
  };

  disableVideo = () => {
    const { sip } = this.context;

    sip.disableVideo(this.props.selectedId);
  };
}

export default View;
