import { computed } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import callStore from '../../---shared/callStore';
import contactStore from '../../---shared/contactStore';
import routerStore from '../../---shared/routerStore';
import Toast from '../../---shared/Toast';
import TransferDial from '../components-Transfer/TransferDial';

@observer
class View extends React.Component {
  @computed get call() {
    return callStore.getRunningCall(this.props.match.params.call);
  }
  static contextTypes = {
    sip: PropTypes.object.isRequired,
    pbx: PropTypes.object.isRequired,
  };

  state = {
    attended: true,
    target: '',
  };

  render() {
    return (
      <TransferDial
        call={this.call}
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
  }

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
    const searchTextLC = this.state.target.toLowerCase();
    const userId = id && id.toLowerCase();
    let pbxUserName;
    const pbxUser = contactStore.getPBXUser(id);

    if (pbxUser) {
      pbxUserName = pbxUser.name.toLowerCase();
    } else {
      pbxUserName = '';
    }

    return userId.includes(searchTextLC) || pbxUserName.includes(searchTextLC);
  };

  getMatchIds = () =>
    contactStore.pbxUsers.map(u => u.id).filter(this.isMatchUser);

  resolveMatch = id => {
    const match = contactStore.getPBXUser(id);

    const ucUser = contactStore.getUCUser(id) || {};

    return {
      name: match.name,
      avatar: ucUser.avatar,
      number: id,
      calling: !!match.talkers?.filter(t => t.status === 'calling').length,
      ringing: !!match.talkers?.filter(t => t.status === 'ringing').length,
      talking: !!match.talkers?.filter(t => t.status === 'talking').length,
      holding: !!match.talkers?.filter(t => t.status === 'holding').length,
    };
  };

  selectMatch = number => {
    this.setTarget(number);
  };

  transfer = () => {
    const target = this.state.target;

    if (!target.trim()) {
      Toast.error('No target');
      return;
    }

    const { pbx } = this.context;

    const { attended } = this.state;

    const promise = attended
      ? pbx.transferTalkerAttended(
          this.call.pbxTenant,
          this.call.pbxTalkerId,
          this.state.target,
        )
      : pbx.transferTalkerBlind(
          this.call.pbxTenant,
          this.call.pbxTalkerId,
          this.state.target,
        );
    promise.then(this.onTransferSuccess, this.onTransferFailure);
  };

  onTransferSuccess = target => {
    const { attended } = this.state;

    if (!attended) return routerStore.goToCallsManage();

    callStore.upsertRunning({
      id: this.call.id,
      transfering: target,
    });

    routerStore.goToCallTransferAttend(this.call.id);
  };

  onTransferFailure = err => {
    console.error(err);
    Toast.error('Failed target transfer the call');
  };

  transferBlind = target => {
    if (!target.trim()) {
      Toast.error('No target');
      return;
    }

    const { pbx } = this.context;

    const promise = pbx.transferTalkerBlind(
      this.call.pbxTenant,
      this.call.pbxTalkerId,
      target,
    );
    promise.then(this.onTransferSuccess(target), this.onTransferFailure);
  };

  transferAttended = target => {
    if (!target.trim()) {
      Toast.error('No target');
      return;
    }

    const { pbx } = this.context;

    const promise = pbx.transferTalkerAttended(
      this.call.pbxTenant,
      this.call.pbxTalkerId,
      target,
    );
    promise.then(this.onTransferSuccess(target), this.onTransferFailure);
  };

  onTransferAttendedForVideoSuccess = target => {
    const { attended } = this.state;

    if (!attended) return routerStore.goToCallsManage();

    callStore.upsertRunning({
      id: this.call.id,
      transfering: target,
    });

    routerStore.goToCallTransferAttend(this.call.id);

    const { sip } = this.context;

    sip.enableVideo(this.call.id);
  };

  onTransferAttendedForVideoFailure = err => {
    console.error(err);
    Toast.error('Failed target transfer the call');
  };

  transferAttendedForVideo = target => {
    if (!target.trim()) {
      Toast.error('No target');
      return;
    }

    const { pbx } = this.context;

    const promise = pbx.transferTalkerAttended(
      this.call.pbxTenant,
      this.call.pbxTalkerId,
      target,
    );

    promise.then(
      this.onTransferAttendedForVideoSuccess(target),
      this.onTransferAttendedForVideoFailure,
    );
  };
}

export default View;
