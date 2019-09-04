import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import { createModelView } from 'redux-model';

import TransferDial from '../../components-Transfer/TransferDial';
import routerStore from '../../mobx/routerStore';
import toast from '../../shared/Toast';

@observer
@createModelView(
  getter => (state, props) => ({
    call: getter.runningCalls.detailMapById(state)[props.match.params.call],
    pbxUserIds: getter.pbxUsers.idsByOrder(state),
    pbxUserById: getter.pbxUsers.detailMapById(state),
    ucUserById: getter.ucUsers.detailMapById(state),
  }),
  action => emit => ({
    updateCall(call) {
      emit(action.runningCalls.update(call));
    },
  }),
)
@observer
class View extends React.Component {
  static contextTypes = {
    sip: PropTypes.object.isRequired,
    pbx: PropTypes.object.isRequired,
  };

  static defaultProps = {
    pbxUserIds: [],
    pbxUserById: {},
    ucUserById: {},
  };

  state = {
    attended: true,
    target: '',
  };

  render = () => (
    <TransferDial
      call={this.props.call}
      attended={this.state.attended}
      target={this.state.target}
      matchIds={this.getMatchIds()}
      resolveMatch={this.resolveMatch}
      selectMatch={this.selectMatch}
      setAttended={this.setAttended}
      setTarget={this.setTarget}
      transfer={this.transfer}
      back={routerStore.goToCallsManage}
      transferAttended={this.transferAttended}
      transferBlind={this.transferBlind}
      transferAttendedForVideo={this.transferAttendedForVideo}
    />
  );

  setAttended = attended => {
    this.setState({
      attended,
    });
  };

  setTarget = target => {
    this.setState({
      target,
    });
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
    const { ucUserById } = this.props;

    const ucUser = ucUserById[id] || {};

    return {
      name: match.name,
      avatar: ucUser.avatar,
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
      toast.error('No target');
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

  onTransferSuccess = target => {
    const { call } = this.props;

    const { attended } = this.state;

    if (!attended) return routerStore.goToCallsManage();

    this.props.updateCall({
      id: call.id,
      transfering: target,
    });

    routerStore.goToCallTransferAttend(call.id);
  };

  onTransferFailure = err => {
    console.error(err);
    toast.error('Failed target transfer the call');
  };

  transferBlind = target => {
    if (!target.trim()) {
      toast.error('No target');
      return;
    }

    const { pbx } = this.context;

    const promise = pbx.transferTalkerBlind(
      this.props.call.pbxTenant,
      this.props.call.pbxTalkerId,
      target,
    );
    promise.then(this.onTransferSuccess(target), this.onTransferFailure);
  };

  transferAttended = target => {
    if (!target.trim()) {
      toast.error('No target');
      return;
    }

    const { pbx } = this.context;

    const promise = pbx.transferTalkerAttended(
      this.props.call.pbxTenant,
      this.props.call.pbxTalkerId,
      target,
    );
    promise.then(this.onTransferSuccess(target), this.onTransferFailure);
  };

  onTransferAttendedForVideoSuccess = target => {
    const { call } = this.props;

    const { attended } = this.state;

    if (!attended) return routerStore.goToCallsManage();

    this.props.updateCall({
      id: call.id,
      transfering: target,
    });

    routerStore.goToCallTransferAttend(call.id);

    const { sip } = this.context;

    sip.enableVideo(call.id);
  };

  onTransferAttendedForVideoFailure = err => {
    console.error(err);
    toast.error('Failed target transfer the call');
  };

  transferAttendedForVideo = target => {
    if (!target.trim()) {
      toast.error('No target');
      return;
    }

    const { pbx } = this.context;

    const promise = pbx.transferTalkerAttended(
      this.props.call.pbxTenant,
      this.props.call.pbxTalkerId,
      target,
    );

    promise.then(
      this.onTransferAttendedForVideoSuccess(target),
      this.onTransferAttendedForVideoFailure,
    );
  };
}

export default View;
