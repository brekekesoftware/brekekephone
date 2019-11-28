import {
  mdiMicrophone,
  mdiMicrophoneOff,
  mdiPause,
  mdiPhone,
  mdiPhoneHangup,
  mdiPhoneInTalkOutline,
  mdiPhoneMissedOutline,
  mdiPhoneOutgoingOutline,
  mdiPhonePausedOutline,
  mdiPlay,
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
import v from '../variables';

const s = StyleSheet.create({
  CallBar: {
    position: `absolute`,
    top: 0,
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    borderColor: v.hoverBg,
    backgroundColor: v.hoverBg,
    zIndex: 10, // hot fix: callbar is hidden. -> TODO: fix it.
  },
  CallBar_Outer: {
    flexDirection: `row`,
    padding: 5,
    alignItems: `center`,
  },
  CallBar_Icon: {
    flex: 1,
  },
  CallBar_Info: {
    flex: 2,
  },

  CallBar_BtnCall: {
    flex: 5,
    flexDirection: `row`,
    justifyContent: `flex-end`,
  },
});

const RunningItem = p => (
  <TouchableOpacity onPress={p.pressCallsManage} style={s.CallBar_Outer}>
    <View style={s.CallBar_Icon}>
      {!p.activecall.answered && p.activecall.incoming && (
        <Icon color={v.mainBg} path={mdiPhoneInTalkOutline} />
      )}
      {p.activecall.incoming && !p.activecall.answered && (
        <Icon color={v.redBg} path={mdiPhoneMissedOutline} />
      )}
      {!p.activecall.answered && !p.activecall.incoming && (
        <Icon color={v.mainBg} path={mdiPhoneOutgoingOutline} />
      )}
      {p.activecall.answered && p.activecall.holding && (
        <Icon color={v.borderBg} path={mdiPhonePausedOutline} />
      )}
      {p.activecall.answered && !p.activecall.holding && (
        <Icon color={v.mainBg} path={mdiPhone} />
      )}
    </View>
    <View style={s.CallBar_Info}>
      <Text>{p.activecall.partyName || p.activecall.partyNumber}</Text>
      <Text>{p.activecall.partyNumber}</Text>
    </View>
    <View style={s.CallBar_BtnCall}>
      {p.activecall.answered && p.activecall.holding && (
        <ButtonIcon
          bdcolor={v.borderBg}
          color={v.callBg}
          onPress={p.unhold}
          path={mdiPlay}
        />
      )}
      {!p.activecall.holding && (
        <ButtonIcon
          bdcolor={v.borderBg}
          color={v.redBg}
          onPress={p.hangup}
          path={mdiPhoneHangup}
        />
      )}
      {p.activecall.answered &&
        !p.activecall.holding &&
        !p.activecall.muted && (
          <ButtonIcon
            bdcolor={v.borderBg}
            color={v.color}
            onPress={p.setMuted}
            path={mdiMicrophoneOff}
          />
        )}
      {p.activecall.answered && !p.activecall.holding && p.activecall.muted && (
        <ButtonIcon
          bdcolor={v.borderBg}
          color={v.color}
          onPress={p.setunMuted}
          path={mdiMicrophone}
        />
      )}
      {p.activecall.answered &&
        !p.activecall.holding &&
        !p.activecall.loudspeaker &&
        Platform.OS !== `web` && (
          <ButtonIcon
            bdcolor={v.borderBg}
            onPress={p.onOpenLoudSpeaker}
            path={mdiVolumeHigh}
          />
        )}
      {p.activecall.answered &&
        !p.activecall.holding &&
        p.activecall.loudspeaker &&
        Platform.OS !== `web` && (
          <ButtonIcon
            bdcolor={v.borderBg}
            onPress={p.onCloseLoudSpeaker}
            path={mdiVolumeMedium}
          />
        )}
      {p.activecall.answered && !p.activecall.holding && (
        <ButtonIcon
          bdcolor={v.borderBg}
          color={v.callBg}
          onPress={p.hold}
          path={mdiPause}
        />
      )}
    </View>
  </TouchableOpacity>
);

@observer
class Callbar extends React.Component {
  @computed get callById() {
    return arrToMap(callStore.runnings, `id`, c => c);
  }

  static contextTypes = {
    sip: PropTypes.object.isRequired,
    pbx: PropTypes.object.isRequired,
  };

  render() {
    const bVisible = g.stacks[0].name !== `CallsManage`;
    const callId = callStore.selectedId || ``;
    const activecall = this.callById[callId];
    return (
      <View style={s.CallBar}>
        {bVisible && callId !== `` && activecall && (
          <RunningItem
            activecall={activecall}
            hangup={this.hangup}
            hold={this.hold}
            onCloseLoudSpeaker={this.onCloseLoudSpeaker}
            onOpenLoudSpeaker={this.onOpenLoudSpeaker}
            pressCallsManage={g.goToPageCallManage}
            setMuted={this.setMuted}
            setunMuted={this.setunMuted}
            unhold={this.unhold}
          />
        )}
      </View>
    );
  }

  setMuted = () => {
    const { sip } = this.context;
    sip.setMuted(true, callStore.selectedId);
    callStore.upsertRunning({
      id: callStore.selectedId,
      muted: true,
    });
  };

  setunMuted = () => {
    const { sip } = this.context;
    sip.setMuted(false, callStore.selectedId);
    callStore.upsertRunning({
      id: callStore.selectedId,
      muted: false,
    });
  };

  onOpenLoudSpeaker = () => {
    const activecallid = callStore.selectedId;
    if (Platform.OS !== `web`) {
      IncallManager.setForceSpeakerphoneOn(true);
    }

    callStore.upsertRunning({
      id: activecallid,
      loudspeaker: true,
    });
  };

  onCloseLoudSpeaker = () => {
    const activecallid = callStore.selectedId;
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

    const activecallid = callStore.selectedId;
    sip.hangupSession(activecallid);
  };

  hold = () => {
    const { pbx } = this.context;

    const activecallid = callStore.selectedId;
    const call = this.callById[activecallid];
    pbx
      .holdTalker(call.pbxTenant, call.pbxTalkerId)
      .then(this.onHoldSuccess)
      .catch(this.onHoldFailure);
  };

  onHoldSuccess = () => {
    const activecallid = callStore.selectedId;

    callStore.upsertRunning({
      id: activecallid,
      holding: true,
    });
  };

  onHoldFailure = err => {
    g.showError({ err, message: `hold the call` });
  };

  unhold = () => {
    const activecallid = callStore.selectedId;

    const { pbx } = this.context;

    const call = this.callById[activecallid];
    pbx
      .unholdTalker(call.pbxTenant, call.pbxTalkerId)
      .then(this.onUnholdSuccess)
      .catch(this.onUnholdFailure);
  };

  onUnholdSuccess = () => {
    const activecallid = callStore.selectedId;

    callStore.upsertRunning({
      id: activecallid,
      holding: false,
    });
  };

  onUnholdFailure = err => {
    g.showError({ err, message: `unhold the call` });
  };
}

export default Callbar;
