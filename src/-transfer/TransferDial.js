import { mdiPhone, mdiPhoneForward } from '@mdi/js';
import orderBy from 'lodash/orderBy';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import callStore from '../-/callStore';
import contactStore from '../-/contactStore';
import g from '../global';
import Field from '../shared/Field';
import Item from '../shared/ItemUser';
import Layout from '../shared/Layout';

@observer
class TransferDial extends React.Component {
  @computed get call() {
    return callStore.getRunningCall(this.props.callId);
  }
  static contextTypes = {
    sip: PropTypes.object.isRequired,
    pbx: PropTypes.object.isRequired,
  };

  state = {
    attended: true,
    target: ``,
  };

  render() {
    const users = this.getMatchIds().map(this.resolveMatch);
    const map = {};

    users.forEach(u => {
      u.name = u.name || u.id;
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
        header={{
          onBackBtnPress: g.goToCallsManage,
          title: `Transfer call`,
        }}
      >
        {groups.map(_g => (
          <React.Fragment>
            <Field isGroup label={_g.key} />
            {_g.users.map((u, i) => (
              <Item
                function={[
                  () => this.transferAttended(u.number),
                  () => g.transferBlind(u.number),
                ]}
                icon={[mdiPhoneForward, mdiPhone]}
                last={i === _g.users.length - 1}
                {...u}
              />
            ))}
          </React.Fragment>
        ))}
      </Layout>
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
      pbxUserName = ``;
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
      calling: !!match.talkers?.filter(t => t.status === `calling`).length,
      ringing: !!match.talkers?.filter(t => t.status === `ringing`).length,
      talking: !!match.talkers?.filter(t => t.status === `talking`).length,
      holding: !!match.talkers?.filter(t => t.status === `holding`).length,
    };
  };

  selectMatch = number => {
    this.setTarget(number);
  };

  transfer = () => {
    const target = this.state.target;

    if (!target.trim()) {
      g.showError({
        err: new Error(`Target is empty`),
        message: `start transfer`,
      });
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
    promise.then(this.onTransferSuccess).catch(this.onTransferFailure);
  };

  onTransferSuccess = target => {
    const { attended } = this.state;

    if (!attended) return g.goToCallsManage();

    callStore.upsertRunning({
      id: this.call.id,
      transfering: target,
    });

    g.goToCallTransferAttend({ callId: this.call.id });
  };

  onTransferFailure = err => {
    g.showError({ err, message: `target transfer the call` });
  };

  transferBlind = target => {
    if (!target.trim()) {
      g.showError({
        err: new Error(`Target is empty`),
        message: `start transfer`,
      });
      return;
    }

    const { pbx } = this.context;

    const promise = pbx.transferTalkerBlind(
      this.call.pbxTenant,
      this.call.pbxTalkerId,
      target,
    );
    promise.then(this.onTransferSuccess(target)).catch(this.onTransferFailure);
  };

  transferAttended = target => {
    if (!target.trim()) {
      g.showError({
        err: new Error(`Target is empty`),
        message: `start transfer`,
      });
      return;
    }

    const { pbx } = this.context;

    const promise = pbx.transferTalkerAttended(
      this.call.pbxTenant,
      this.call.pbxTalkerId,
      target,
    );
    promise.then(this.onTransferSuccess(target)).catch(this.onTransferFailure);
  };

  onTransferAttendedForVideoSuccess = target => {
    const { attended } = this.state;

    if (!attended) return g.goToCallsManage();

    callStore.upsertRunning({
      id: this.call.id,
      transfering: target,
    });

    g.goToCallTransferAttend({ callId: this.call.id });

    const { sip } = this.context;

    sip.enableVideo(this.call.id);
  };

  onTransferAttendedForVideoFailure = err => {
    g.showError({ err, message: `target transfer the call` });
  };

  transferAttendedForVideo = target => {
    if (!target.trim()) {
      g.showError({
        err: new Error(`Target is empty`),
        message: `start transfer`,
      });
      return;
    }

    const { pbx } = this.context;

    const promise = pbx.transferTalkerAttended(
      this.call.pbxTenant,
      this.call.pbxTalkerId,
      target,
    );

    promise
      .then(this.onTransferAttendedForVideoSuccess(target))
      .catch(this.onTransferAttendedForVideoFailure);
  };
}

export default TransferDial;
