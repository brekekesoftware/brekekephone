import {
  mdiMicrophone,
  mdiMicrophoneOff,
  mdiPause,
  mdiPhone,
  mdiPhoneHangup,
  mdiPhoneInTalkOutline,
  mdiPhoneOutgoingOutline,
  mdiPhonePausedOutline,
  mdiPlay,
  mdiVolumeHigh,
  mdiVolumeMedium,
} from '@mdi/js';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import {
  Icon,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from '../-/Rn';
import pbx from '../api/pbx';
import sip from '../api/sip';
import g from '../global';
import callStore from '../global/callStore';
import intl from '../intl/intl';
import IncallManager from '../native/IncallManager';
import ButtonIcon from '../shared/ButtonIcon';
import { arrToMap } from '../utils/toMap';

const css = StyleSheet.create({
  CallBar: {
    borderBottomWidth: 1,
    borderColor: g.borderBg,
    backgroundColor: g.hoverBg,
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
  Notify_Info_PartyName: {
    fontSize: 15,
    fontWeight: `bold`,
  },
});

const RunningItem = p => (
  <TouchableOpacity
    onPress={() => g.goToPageCallManage({ isFromCallBar: true })}
    style={css.CallBar_Outer}
  >
    <View style={css.CallBar_Icon}>
      {!p.activecall.answered && p.activecall.incoming && (
        <Icon color={g.colors.primary} path={mdiPhoneInTalkOutline} />
      )}
      {!p.activecall.answered && !p.activecall.incoming && (
        <Icon color={g.colors.primary} path={mdiPhoneOutgoingOutline} />
      )}
      {p.activecall.answered && p.activecall.holding && (
        <Icon color={g.borderBg} path={mdiPhonePausedOutline} />
      )}
      {p.activecall.answered && !p.activecall.holding && (
        <Icon color={g.colors.primary} path={mdiPhone} />
      )}
    </View>
    <View style={css.CallBar_Info}>
      <Text style={css.Notify_Info_PartyName}>
        {p.activecall.partyName || p.activecall.partyNumber}
      </Text>
      <Text>{p.activecall.partyNumber}</Text>
    </View>
    <View style={css.CallBar_BtnCall}>
      {p.activecall.answered && p.activecall.holding && (
        <ButtonIcon
          bdcolor={g.borderBg}
          color={g.colors.primary}
          onPress={p.unhold}
          path={mdiPlay}
        />
      )}
      {!p.activecall.holding && (
        <ButtonIcon
          bdcolor={g.borderBg}
          color={g.colors.danger}
          onPress={p.hangup}
          path={mdiPhoneHangup}
        />
      )}
      {p.activecall.answered &&
        !p.activecall.holding &&
        !p.activecall.muted && (
          <ButtonIcon
            bdcolor={g.borderBg}
            color={g.color}
            onPress={p.setMuted}
            path={mdiMicrophoneOff}
          />
        )}
      {p.activecall.answered && !p.activecall.holding && p.activecall.muted && (
        <ButtonIcon
          bdcolor={g.borderBg}
          color={g.color}
          onPress={p.setunMuted}
          path={mdiMicrophone}
        />
      )}
      {p.activecall.answered &&
        !p.activecall.holding &&
        !p.activecall.loudspeaker &&
        Platform.OS !== `web` && (
          <ButtonIcon
            bdcolor={g.borderBg}
            onPress={p.onOpenLoudSpeaker}
            path={mdiVolumeHigh}
          />
        )}
      {p.activecall.answered &&
        !p.activecall.holding &&
        p.activecall.loudspeaker &&
        Platform.OS !== `web` && (
          <ButtonIcon
            bdcolor={g.borderBg}
            onPress={p.onCloseLoudSpeaker}
            path={mdiVolumeMedium}
          />
        )}
      {p.activecall.answered && !p.activecall.holding && (
        <ButtonIcon
          bdcolor={g.borderBg}
          color={g.colors.primary}
          onPress={p.hold}
          path={mdiPause}
        />
      )}
    </View>
  </TouchableOpacity>
);

@observer
class CallBar extends React.Component {
  @computed get callById() {
    return arrToMap(callStore.runnings, `id`, c => c);
  }

  render() {
    const bVisible =
      g.stacks.filter(t => t.name === `PageCallManage`).length === 0;
    const callId = callStore.selectedId || ``;
    const activecall = this.callById[callId];
    if (!bVisible || !callId || !activecall) {
      return null;
    }
    return (
      <View style={css.CallBar}>
        <RunningItem
          activecall={activecall}
          hangup={this.hangup}
          hold={this.hold}
          onCloseLoudSpeaker={this.onCloseLoudSpeaker}
          onOpenLoudSpeaker={this.onOpenLoudSpeaker}
          setMuted={this.setMuted}
          setunMuted={this.setunMuted}
          unhold={this.unhold}
        />
      </View>
    );
  }

  setMuted = () => {
    sip.setMuted(true, callStore.selectedId);
    callStore.upsertRunning({
      id: callStore.selectedId,
      muted: true,
    });
  };
  setunMuted = () => {
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
    const activecallid = callStore.selectedId;
    sip.hangupSession(activecallid);
  };
  hold = () => {
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
    g.showError({
      message: intl`Failed to hold the call`,
      err,
    });
  };
  unhold = () => {
    const activecallid = callStore.selectedId;
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
    g.showError({
      message: intl`Failed to unhold the call`,
      err,
    });
  };
}

export default CallBar;
