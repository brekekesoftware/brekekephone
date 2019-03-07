import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createModelView } from 'redux-model';
import createID from 'shortid';
import UI from './ui';

const mapGetter = getter => (state, props) => ({
  call: getter.runningCalls.detailMapById(state)[props.match.params.call],
});

const mapAction = action => emit => ({
  routeToCallsManage() {
    emit(action.router.goToCallsManage());
  },
  updateCall(call) {
    emit(action.runningCalls.update(call));
  },
  showToast(message) {
    emit(action.toasts.create({ id: createID(), message }));
  },
});

class View extends Component {
  static contextTypes = {
    sip: PropTypes.object.isRequired,
    pbx: PropTypes.object.isRequired,
  };

  render = () => (
    <UI
      call={this.props.call}
      back={this.props.routeToCallsManage}
      join={this.join}
      stop={this.stop}
      hangup={this.hangup}
    />
  );

  hangup = () => {
    const { sip } = this.context;
    sip.hangupSession(this.props.selectedId);
  };

  join = () => {
    const { pbx } = this.context;
    pbx
      .joinTalkerTransfer(
        this.props.call.pbxTenant,
        this.props.call.pbxTalkerId,
      )
      .then(this.onJoinSuccess, this.onJoinFailure);
  };

  onJoinSuccess = () => {
    this.props.updateCall({
      id: this.props.call.id,
      transfering: false,
    });
    this.props.routeToCallsManage();
  };

  onJoinFailure = err => {
    console.error(err);
    this.props.showToast('Failed to join the transfer');
  };

  stop = () => {
    const { pbx } = this.context;
    pbx
      .stopTalkerTransfer(
        this.props.call.pbxTenant,
        this.props.call.pbxTalkerId,
      )
      .then(this.onStopSuccess, this.onStopFailure);
  };

  onStopSuccess = () => {
    this.props.updateCall({
      id: this.props.call.id,
      transfering: false,
    });
    this.props.routeToCallsManage();
  };

  onStopFailure = err => {
    console.error(err);
    this.props.showToast('Failed to stop the transfer');
  };
}

export default createModelView(mapGetter, mapAction)(View);
