import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { createModelView } from 'redux-model';

import LoudSpeaker from '../../components/calls-manage/LoudSpeaker';
import authStore from '../../mobx/authStore';
import * as routerUtils from '../../mobx/routerStore';
import toast from '../../nativeModules/toast';
import UI from './ui';

@observer
@createModelView(
  getter => state => ({
    chatsEnabled: (authStore.profile || {}).ucEnabled,
    runningIds: getter.runningCalls.idsByOrder(state),
    runningById: getter.runningCalls.detailMapById(state),
  }),
  action => emit => ({
    updateCall(call) {
      emit(action.runningCalls.update(call));
    },
  }),
)
@observer
class View extends Component {
  state = {
    activecallid: null,
    activecall: null,
  };

  static contextTypes = {
    sip: PropTypes.object.isRequired,
    pbx: PropTypes.object.isRequired,
  };

  render = () => (
    <UI
      activecallid={this.state.activecallid}
      chatsEnabled={this.props.chatsEnabled}
      pressCallsManage={routerUtils.goToCallsManage}
      pressCallsCreate={routerUtils.goToCallsCreate}
      pressSettings={routerUtils.goToSettings}
      pressUsers={routerUtils.goToUsersBrowse}
      pressChats={routerUtils.goToChatsRecent}
      pressBooks={routerUtils.goToPhonebooksBrowse}
      runningIds={this.props.runningIds}
      runningById={this.props.runningById}
      hangup={this.hangup}
      hold={this.hold}
      unhold={this.unhold}
      pathname={this.props.location.pathname}
      onOpenLoudSpeaker={this.onOpenLoudSpeaker}
      onCloseLoudSpeaker={this.onCloseLoudSpeaker}
    />
  );

  onOpenLoudSpeaker = () => {
    const activecallid = this.state.activecallid;
    LoudSpeaker.open(true);

    this.props.updateCall({
      id: activecallid,
      loudspeaker: true,
    });
  };

  onCloseLoudSpeaker = () => {
    const activecallid = this.state.activecallid;
    LoudSpeaker.open(false);

    this.props.updateCall({
      id: activecallid,
      loudspeaker: false,
    });
  };

  hangup = () => {
    const { sip } = this.context;

    const activecallid = this.state.activecallid;
    sip.hangupSession(activecallid);
  };

  hold = () => {
    const { pbx } = this.context;

    const activecallid = this.state.activecallid;
    const call = this.props.runningById[activecallid];
    pbx
      .holdTalker(call.pbxTenant, call.pbxTalkerId)
      .then(this.onHoldSuccess, this.onHoldFailure);
  };

  onHoldSuccess = () => {
    const activecallid = this.state.activecallid;

    this.props.updateCall({
      id: activecallid,
      holding: true,
    });
  };

  onHoldFailure = err => {
    console.error(err);
    toast.error('Failed to hold the call');
  };

  unhold = () => {
    const activecallid = this.state.activecallid;

    const { pbx } = this.context;

    const call = this.props.runningById[activecallid];
    pbx
      .unholdTalker(call.pbxTenant, call.pbxTalkerId)
      .then(this.onUnholdSuccess, this.onUnholdFailure);
  };

  onUnholdSuccess = () => {
    const activecallid = this.state.activecallid;

    this.props.updateCall({
      id: activecallid,
      holding: false,
    });
  };

  onUnholdFailure = err => {
    const activecallid = this.state.activecallid;
    console.error('onUnholdFailure activecallid=' + activecallid);
    console.error(err);
    toast.error('Failed to unhold the call');
  };

  findActiveCallByRunids_s(runids, props) {
    if (!runids || !runids.length) {
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

  componentWillReceiveProps(nextProps) {
    const runids = nextProps.runningIds;
    const latestCall = this.findActiveCallByRunids_s(runids, nextProps);

    if (latestCall) {
      this.setState({
        activecallid: latestCall.id,
      });

      this.setState({
        activecall: latestCall,
      });
    } else {
      this.setState({
        activecallid: null,
      });

      this.setState({
        activecall: null,
      });
    }
  }
}

export default View;
