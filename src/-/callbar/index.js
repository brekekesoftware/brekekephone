import { computed } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import { Platform } from 'react-native';

import g from '../../global';
import IncallManager from '../../native/IncallManager';
import arrToMap from '../arrToMap';
import authStore from '../authStore';
import callStore from '../callStore';
import UI from './ui';

@observer
class View extends React.Component {
  @computed get callById() {
    return arrToMap(callStore.runnings, 'id', c => c);
  }

  state = {
    activecallid: null,
    activecall: null,
  };

  static contextTypes = {
    sip: PropTypes.object.isRequired,
    pbx: PropTypes.object.isRequired,
  };

  render() {
    return (
      <UI
        activecallid={this.state.activecallid}
        chatsEnabled={authStore.profile?.ucEnabled}
        pressCallsManage={g.goToCallsManage}
        pressCallsCreate={g.goToCallsCreate}
        pressSettings={g.goToSettings}
        pressUsers={g.goToUsersBrowse}
        pressChats={g.goToChatsRecent}
        pressBooks={g.goToPhonebooksBrowse}
        runningIds={callStore.runnings.map(c => c.id)}
        runningById={this.callById}
        hangup={this.hangup}
        hold={this.hold}
        unhold={this.unhold}
        pathname={this.props.location.pathname}
        onOpenLoudSpeaker={this.onOpenLoudSpeaker}
        onCloseLoudSpeaker={this.onCloseLoudSpeaker}
      />
    );
  }

  onOpenLoudSpeaker = () => {
    const activecallid = this.state.activecallid;
    if (Platform.OS !== 'web') {
      IncallManager.setForceSpeakerphoneOn(true);
    }

    callStore.upsertRunning({
      id: activecallid,
      loudspeaker: true,
    });
  };

  onCloseLoudSpeaker = () => {
    const activecallid = this.state.activecallid;
    if (Platform.OS !== 'web') {
      IncallManager.setForceSpeakerphoneOn(false);
    }

    callStore.upsertRunning({
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
    const call = this.callById[activecallid];
    pbx
      .holdTalker(call.pbxTenant, call.pbxTalkerId)
      .then(this.onHoldSuccess, this.onHoldFailure);
  };

  onHoldSuccess = () => {
    const activecallid = this.state.activecallid;

    callStore.upsertRunning({
      id: activecallid,
      holding: true,
    });
  };

  onHoldFailure = err => {
    console.error(err);
    g.showError({ message: 'hold the call' });
  };

  unhold = () => {
    const activecallid = this.state.activecallid;

    const { pbx } = this.context;

    const call = this.callById[activecallid];
    pbx
      .unholdTalker(call.pbxTenant, call.pbxTalkerId)
      .then(this.onUnholdSuccess, this.onUnholdFailure);
  };

  onUnholdSuccess = () => {
    const activecallid = this.state.activecallid;

    callStore.upsertRunning({
      id: activecallid,
      holding: false,
    });
  };

  onUnholdFailure = err => {
    const activecallid = this.state.activecallid;
    console.error('onUnholdFailure activecallid=' + activecallid);
    console.error(err);
    g.showError({ message: 'unhold the call' });
  };

  findActiveCallByRunids_s(runids, props) {
    if (!runids || !runids.length) {
      return null;
    }

    let latestCall = null;

    for (let i = 0; i < runids.length; i++) {
      const runid = runids[i];
      const call = this.callById[runid];
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
