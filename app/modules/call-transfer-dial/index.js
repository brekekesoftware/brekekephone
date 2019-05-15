import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { createModelView } from 'redux-model';
import createId from 'shortid';

import * as routerUtils from '../../mobx/routerStore';
import UI from './ui';

const mapGetter = getter => (state, props) => ({
  call: getter.runningCalls.detailMapById(state)[props.match.params.call],
  pbxUserIds: getter.pbxUsers.idsByOrder(state),
  pbxUserById: getter.pbxUsers.detailMapById(state),
});

const mapAction = action => emit => ({
  updateCall(call) {
    emit(action.runningCalls.update(call));
  },
  showToast(message) {
    emit(action.toasts.create({ id: createId(), message }));
  },
});

class View extends Component {
  static contextTypes = {
    sip: PropTypes.object.isRequired,
    pbx: PropTypes.object.isRequired,
  };

  static defaultProps = {
    pbxUserIds: [],
    pbxUserById: {},
  };

  state = {
    attended: true,
    target: '',
  };

  render = () => (
    <UI
      call={this.props.call}
      attended={this.state.attended}
      target={this.state.target}
      matchIds={this.getMatchIds()}
      resolveMatch={this.resolveMatch}
      selectMatch={this.selectMatch}
      setAttended={this.setAttended}
      setTarget={this.setTarget}
      transfer={this.transfer}
      back={routerUtils.goToCallsManage}
      transferAttended={this.transferAttended}
      transferBlind={this.transferBlind}
      transferAttendedForVideo={this.transferAttendedForVideo}
    />
  );

  setAttended = attended => {
    this.setState({ attended });
  };

  setTarget = target => {
    this.setState({ target });
  };

  isMatchUser = id => {
    const { pbxUserById } = this.props;
    const searchTextLC = this.state.target.toLowerCase();

    const userId = id && id.toLowerCase();

    let pbxUserName;
    const pbxUser = pbxUserById[id];
    if (pbxUser) {
      pbxUserName = pbxUser.name.toLowerCase();
    } else {
      pbxUserName = '';
    }

    return userId.includes(searchTextLC) || pbxUserName.includes(searchTextLC);
  };

  getMatchIds = () => this.props.pbxUserIds.filter(this.isMatchUser);

  resolveMatch = id => {
    const match = this.props.pbxUserById[id];
    return {
      name: match.name,
      number: id,
      calling: !!match.callingTalkers.length,
      ringing: !!match.ringingTalkers.length,
      talking: !!match.talkingTalkers.length,
      holding: !!match.holdingTalkers.length,
    };
  };

  selectMatch = number => {
    this.setTarget(number);
  };

  transfer = () => {
    const target = this.state.target;
    if (!target.trim()) {
      this.props.showToast('No target');
      return;
    }

    const { pbx } = this.context;
    const { attended } = this.state;
    const promise = attended
      ? pbx.transferTalkerAttended(
          this.props.call.pbxTenant,
          this.props.call.pbxTalkerId,
          this.state.target,
        )
      : pbx.transferTalkerBlind(
          this.props.call.pbxTenant,
          this.props.call.pbxTalkerId,
          this.state.target,
        );

    promise.then(this.onTransferSuccess, this.onTransferFailure);
  };

  onTransferSuccess = () => {
    const { call } = this.props;
    const { attended, target } = this.state;
    if (!attended) return routerUtils.goToCallsManage();

    this.props.updateCall({ id: call.id, transfering: target });
    routerUtils.goToCallTransferAttend(call.id);
  };

  onTransferFailure = err => {
    console.error(err);
    this.props.showToast('Failed target transfer the call');
  };

  transferBlind = () => {
    const target = this.state.target;
    if (!target.trim()) {
      this.props.showToast('No target');
      return;
    }

    const { pbx } = this.context;
    const promise = pbx.transferTalkerBlind(
      this.props.call.pbxTenant,
      this.props.call.pbxTalkerId,
      this.state.target,
    );

    promise.then(this.onTransferSuccess, this.onTransferFailure);
  };

  transferAttended = () => {
    const target = this.state.target;
    if (!target.trim()) {
      this.props.showToast('No target');
      return;
    }

    const { pbx } = this.context;
    const promise = pbx.transferTalkerAttended(
      this.props.call.pbxTenant,
      this.props.call.pbxTalkerId,
      this.state.target,
    );

    promise.then(this.onTransferSuccess, this.onTransferFailure);
  };

  onTransferAttendedForVideoSuccess = () => {
    const { call } = this.props;
    const { attended, target } = this.state;
    if (!attended) return routerUtils.goToCallsManage();

    this.props.updateCall({ id: call.id, transfering: target });

    routerUtils.goToCallTransferAttend(call.id);

    const { sip } = this.context;
    sip.enableVideo(call.id);
  };

  onTransferAttendedForVideoFailure = err => {
    console.error(err);
    this.props.showToast('Failed target transfer the call');
  };

  transferAttendedForVideo = () => {
    const target = this.state.target;
    if (!target.trim()) {
      this.props.showToast('No target');
      return;
    }

    const { pbx } = this.context;
    const promise = pbx.transferTalkerAttended(
      this.props.call.pbxTenant,
      this.props.call.pbxTalkerId,
      this.state.target,
    );

    promise.then(
      this.onTransferAttendedForVideoSuccess,
      this.onTransferAttendedForVideoFailure,
    );
  };
}

export default createModelView(mapGetter, mapAction)(View);
