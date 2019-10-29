import {
  mdiPauseCircleOutline,
  mdiPhone,
  mdiPhoneHangupOutline,
  mdiPhoneInTalkOutline,
  mdiPhoneMissedOutline,
  mdiPhoneOutgoingOutline,
  mdiPhonePausedOutline,
  mdiPlayCircleOutline,
  mdiVolumeHigh,
  mdiVolumeMedium,
} from '@mdi/js';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import callStore from '../-/callStore';
import g from '../global';
import IncallManager from '../native/IncallManager';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from '../native/Rn';
import ButtonIcon from '../shared/ButtonIcon';
import Icon from '../shared/Icon';
import { arrToMap } from '../utils/toMap';

const s = StyleSheet.create({
  CallBar: {
    position: `absolute`,
    top: 0,
    left: 0,
    right: 0,
  },
  CallBar_Outer: {
    flexDirection: `row`,
  },
});

const RunningItem = p => (
  <TouchableOpacity style={s.CallBar_Outer} onPress={p.pressCallsManage}>
    {!p.activecall.answered && p.activecall.incoming && (
      <Icon path={mdiPhoneInTalkOutline} />
    )}
    {p.activecall.incoming && !p.activecall.answered && (
      <Icon path={mdiPhoneMissedOutline} />
    )}
    {!p.activecall.answered && !p.activecall.incoming && (
      <Icon path={mdiPhoneOutgoingOutline} />
    )}
    {p.activecall.answered && p.activecall.holding && (
      <Icon path={mdiPhonePausedOutline} />
    )}
    {p.activecall.answered && !p.activecall.holding && <Icon path={mdiPhone} />}
    <View>
      <Text>{p.activecall.partyName || p.activecall.partyNumber}</Text>
      <Text>{p.activecall.partyNumber}</Text>
    </View>
    {p.activecall.answered && p.activecall.holding && (
      <ButtonIcon onPress={p.unhold} path={mdiPlayCircleOutline} />
    )}
    {!p.activecall.holding && (
      <ButtonIcon onPress={p.hangup} path={mdiPhoneHangupOutline} />
    )}
    {p.activecall.answered &&
      !p.activecall.holding &&
      !p.activecall.loudspeaker &&
      Platform.OS !== `web` && (
        <ButtonIcon onPress={p.onOpenLoudSpeaker} path={mdiVolumeHigh} />
      )}
    {p.activecall.answered &&
      !p.activecall.holding &&
      p.activecall.loudspeaker &&
      Platform.OS !== `web` && (
        <ButtonIcon onPress={p.onCloseLoudSpeaker} path={mdiVolumeMedium} />
      )}
    {p.activecall.answered && !p.activecall.holding && (
      <ButtonIcon onPress={p.hold} path={mdiPauseCircleOutline} />
    )}
  </TouchableOpacity>
);

@observer
class Callbar extends React.Component {
  @computed get callById() {
    return arrToMap(callStore.runnings, `id`, c => c);
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
    const bVisible =
      this.state.activecallid &&
      this.props.location.pathname !== `/auth/calls/manage`;
    console.warn(`bvi`, bVisible);
    return (
      <View style={s.CallBar}>
        {bVisible && (
          <RunningItem
            hangup={this.hangup}
            hold={this.hold}
            unhold={this.unhold}
            activecallid={this.state.activecallid}
            activecall={this.callById[this.state.activecallid]}
            pressCallsManage={g.goToCallsManage}
            onOpenLoudSpeaker={this.onOpenLoudSpeaker}
            onCloseLoudSpeaker={this.onCloseLoudSpeaker}
          />
        )}
      </View>
    );
  }

  onOpenLoudSpeaker = () => {
    const activecallid = this.state.activecallid;
    if (Platform.OS !== `web`) {
      IncallManager.setForceSpeakerphoneOn(true);
    }

    callStore.upsertRunning({
      id: activecallid,
      loudspeaker: true,
    });
  };

  onCloseLoudSpeaker = () => {
    const activecallid = this.state.activecallid;
    if (Platform.OS !== `web`) {
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
    g.showError({ err, message: `hold the call` });
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
    g.showError({ err, message: `unhold the call` });
  };

  findActiveCallByRunids_s(runids, props) {
    console.warn(`len`, runids.length);
    if (!runids || !runids.length) {
      console.warn(`vao cai null`);
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
    const runids = callStore.runnings.map(c => c.id);
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

export default Callbar;
