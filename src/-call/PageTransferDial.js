import { mdiPhone, mdiPhoneForward } from '@mdi/js';
import orderBy from 'lodash/orderBy';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import UserItem from '../-contact/UserItem';
import pbx from '../api/pbx';
import g from '../global';
import callStore from '../global/callStore';
import contactStore from '../global/contactStore';
import Field from '../shared/Field';
import Layout from '../shared/Layout';

@observer
class PageTransferDial extends React.Component {
  @computed get call() {
    return callStore.getRunningCall(this.props.callId);
  }

  resolveMatch = id => {
    const match = contactStore.getPBXUser(id);
    const ucUser = contactStore.getUCUser(id) || {};
    return {
      name: match.name,
      avatar: ucUser.avatar,
      number: id,
      calling: !!match.talkers?.filter(t => t.status === `calling`).length,
      ringing: !!match.talkers?.filter(t => t.status === `ringing`).length,
      talking: !!match.talkers?.filter(t => t.status === `talking`).length,
      holding: !!match.talkers?.filter(t => t.status === `holding`).length,
    };
  };

  onTransferFailure = err => {
    g.showError({ message: `Failed to transfer the call`, err });
  };
  transferBlind = target => {
    const promise = pbx.transferTalkerBlind(
      this.call.pbxTenant,
      this.call.pbxTalkerId,
      target,
    );
    promise.then(g.goToPageCallRecents).catch(this.onTransferFailure);
  };
  transferAttended = target => {
    const promise = pbx.transferTalkerAttended(
      this.call.pbxTenant,
      this.call.pbxTalkerId,
      target,
    );
    promise
      .then(() => {
        callStore.upsertRunning({
          id: this.call.id,
          transfering: target,
        });
        g.stacks.pop();
        g.goToPageTransferAttend({ callId: this.call.id });
      })
      .catch(this.onTransferFailure);
  };

  render() {
    const users = contactStore.pbxUsers.map(u => u.id).map(this.resolveMatch);
    const map = {};
    users.forEach(u => {
      u.name = u.name || u.number || ``;
      let c0 = u.name.charAt(0).toUpperCase();
      if (!/[A-Z]/.test(c0)) {
        c0 = `#`;
      }
      if (!map[c0]) {
        map[c0] = [];
      }
      map[c0].push(u);
    });
    let groups = Object.keys(map).map(k => ({
      key: k,
      users: map[k],
    }));
    groups = orderBy(groups, `key`);
    groups.forEach(g => {
      g.users = orderBy(g.users, `name`);
    });
    return (
      <Layout
        description="Select target to start transfer"
        onBack={g.backToPageCallManage}
        title="Transfer call"
      >
        {groups.map(_g => (
          <React.Fragment key={_g.key}>
            <Field isGroup label={_g.key} />
            {_g.users.map((u, i) => (
              <UserItem
                iconFuncs={[
                  () => this.transferAttended(u.number),
                  () => this.transferBlind(u.number),
                ]}
                icons={[mdiPhoneForward, mdiPhone]}
                key={i}
                {...u}
              />
            ))}
          </React.Fragment>
        ))}
      </Layout>
    );
  }
}

export default PageTransferDial;
