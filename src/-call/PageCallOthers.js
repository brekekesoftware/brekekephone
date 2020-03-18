import { mdiPhoneHangup } from '@mdi/js';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import { TouchableOpacity } from '../-/Rn';
import UserItem from '../-contact/UserItem';
import pbx from '../api/pbx';
import sip from '../api/sip';
import g from '../global';
import callStore from '../global/callStore';
import intl from '../intl/intl';
import Layout from '../shared/Layout';
import { arrToMap } from '../utils/toMap';

@observer
class PageCallOthers extends React.Component {
  @computed get runningIds() {
    return callStore.runnings.map(c => c.id);
  }
  @computed get runningById() {
    return arrToMap(callStore.runnings, `id`, c => c);
  }
  hangupFunc = id => {
    const u = callStore.runnings.map(c => {
      return this.runningById[c.id];
    });
    sip.hangupSession(id);
    if (u.length <= 1) {
      g.backToPageCallRecents();
    }
  };

  onUnholdSuccess = selectedId => {
    callStore.upsertRunning({
      id: selectedId,
      holding: false,
    });
  };
  onUnholdFailure = err => {
    g.showError({
      message: intl.debug`Failed to unhold the call`,
      err,
    });
  };

  hangup = id => {
    const call = this.runningById[id];
    if (!call?.holding) {
      this.hangupFunc(call.id);
    } else {
      pbx
        .unholdTalker(call.pbxTenant, call.pbxTalkerId)
        .then(() => this.onUnholdSuccess(call.id))
        .then(() => this.hangupFunc(call.id))
        .catch(this.onUnholdFailure);
    }
  };

  onHoldSuccess = () => {
    callStore.upsertRunning({
      id: callStore.selectedId,
      holding: true,
    });
  };
  onHoldFailure = err => {
    g.showError({
      message: intl.debug`Failed to hold the call`,
      err,
    });
  };

  setSelectedId = id => {
    const call = this.runningById[callStore.selectedId];
    if (id === callStore.selectedId) {
      g.backToPageCallManage();
    } else {
      pbx
        .holdTalker(call.pbxTenant, call.pbxTalkerId)
        .then(this.onHoldSuccess)
        .then(() => callStore.setSelectedId(id))
        .then(g.backToPageCallManage)
        .catch(this.onHoldFailure);
    }
  };
  render() {
    const u = callStore.runnings.map(c => {
      return this.runningById[c.id];
    });
    return (
      <Layout
        compact
        noScroll
        onBack={g.backToPageCallManage}
        title={intl`Background calls`}
      >
        {u.map(call => (
          <TouchableOpacity
            key={call.id}
            onPress={() => this.setSelectedId(call.id)}
          >
            <UserItem
              iconFuncs={[() => this.hangup(call.id)]}
              icons={[mdiPhoneHangup]}
              key={call.id}
              {...call}
            />
          </TouchableOpacity>
        ))}
      </Layout>
    );
  }
}

export default PageCallOthers;
