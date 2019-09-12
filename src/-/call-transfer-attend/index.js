import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import g from '../../global';
import callStore from '../callStore';
import TransferAttend from '../components-Transfer/TransferAttend';
import contactStore from '../contactStore';
import routerStore from '../routerStore';

@observer
class View extends React.Component {
  static contextTypes = {
    sip: PropTypes.object.isRequired,
    pbx: PropTypes.object.isRequired,
  };

  render() {
    return (
      <TransferAttend
        call={callStore.getRunningCall(this.props.match.params.call)}
        back={routerStore.goToCallsManage}
        join={this.join}
        stop={this.stop}
        hangup={this.hangup}
        resolveMatch={this.resolveMatch}
      />
    );
  }

  resolveMatch = id => {
    const ucUser = contactStore.getUCUser(id) || {};

    return {
      avatar: ucUser.avatar,
      number: id,
    };
  };

  hangup = () => {
    const { sip } = this.context;

    sip.hangupSession(this.props.selectedId);
  };

  join = () => {
    const { pbx } = this.context;
    const call = callStore.getRunningCall(this.props.match.params.call);

    pbx
      .joinTalkerTransfer(call.pbxTenant, call.pbxTalkerId)
      .then(this.onJoinSuccess, this.onJoinFailure);
  };

  onJoinSuccess = () => {
    callStore.upsertRunning({
      id: this.props.match.params.call,
      transfering: false,
    });

    routerStore.goToCallsManage();
  };

  onJoinFailure = err => {
    console.error(err);
    g.showError({ message: 'join the transfer' });
  };

  stop = () => {
    const { pbx } = this.context;
    const call = callStore.getRunningCall(this.props.match.params.call);
    pbx
      .stopTalkerTransfer(call.pbxTenant, call.pbxTalkerId)
      .then(this.onStopSuccess, this.onStopFailure);
  };

  onStopSuccess = () => {
    callStore.upsertRunning({
      id: this.props.match.params.call,
      transfering: false,
    });

    routerStore.goToCallsManage();
  };

  onStopFailure = err => {
    console.error(err);
    g.showError({ message: 'stop the transfer' });
  };
}

export default View;
