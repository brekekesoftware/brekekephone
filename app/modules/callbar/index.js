import React, { Component } from 'react';
import { createModelView } from 'redux-model';
import UI from './ui';
import PropTypes from 'prop-types';
import createID from 'shortid';

const mapGetter = getter => state => ({
  chatsEnabled: (getter.auth.profile(state) || {}).ucEnabled,
  runningIds: getter.runningCalls.idsByOrder(state),
  runningById: getter.runningCalls.detailMapById(state),
});

const mapAction = action => emit => ({
  routeToCallsManage() {
    emit(action.router.goToCallsManage());
  },
  routeToCallsCreate() {
    emit(action.router.goToCallsCreate());
  },
  routeToSettings() {
    emit(action.router.goToSettings());
  },
  routeToUsersBrowse() {
    emit(action.router.goToUsersBrowse());
  },
  routeToRecentChats() {
    emit(action.router.goToChatsRecent());
  },
  routeToPhonebooks() {
    emit(action.router.goToPhonebooksBrowse());
  },

  showToast(message) {
    emit(action.toasts.create({ id: createID(), message }));
  },
  updateCall(call) {
    emit(action.runningCalls.update(call));
  },
});

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
      pressCallsManage={this.props.routeToCallsManage}
      pressCallsCreate={this.props.routeToCallsCreate}
      pressSettings={this.props.routeToSettings}
      pressUsers={this.props.routeToUsersBrowse}
      pressChats={this.props.routeToRecentChats}
      pressBooks={this.props.routeToPhonebooks}
      runningIds={this.props.runningIds}
      runningById={this.props.runningById}
      hangup={this.hangup}
      hold={this.hold}
      unhold={this.unhold}
      pathname={this.props.location.pathname}
    />
  );

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
    this.props.showToast('Failed to hold the call');
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
    this.props.showToast('Failed to unhold the call');
  };

  findActiveCallByRunids_s(runids, props) {
    if (!runids || runids.length == 0) {
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
      this.setState({ activecallid: latestCall.id });
      this.setState({ activecall: latestCall });
    } else {
      this.setState({ activecallid: null });
      this.setState({ activecall: null });
    }
  }
}

export default createModelView(mapGetter, mapAction)(View);
