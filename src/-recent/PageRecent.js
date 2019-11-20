import { mdiPhone } from '@mdi/js';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import authStore from '../-/authStore';
import contactStore from '../-/contactStore';
import g from '../global';
import Item from '../shared/ItemUser';
import Layout from '../shared/Layout';
import Search from '../shared/Search';

@observer
class Recent extends React.Component {
  static contextTypes = {
    sip: PropTypes.object.isRequired,
  };

  isMatchUser = call => {
    if (call.partyNumber.includes(contactStore.searchText)) {
      return call.id;
    }
  };

  callBack = id => {
    const number = authStore.profile.recentCalls?.find(c => c.id === id)
      ?.partyNumber;
    if (number) {
      this.context.sip.createSession(number);
      g.goToCallsManage();
    } else {
      g.showError({ message: `Could not find number from store to call` });
    }
  };

  getAvatar = id => {
    const ucUser = contactStore.getUCUser(id) || {};

    return {
      id: id,
      avatar: ucUser.avatar,
    };
  };

  getMatchUserIds = () =>
    authStore.profile.recentCalls.filter(this.isMatchUser);

  render() {
    const users = this.getMatchUserIds();
    return (
      <Layout
        header={{
          title: `Recent`,
        }}
      >
        <Search
          onValueChange={contactStore.setF(`searchText`)}
          value={contactStore.searchText}
        />
        {users.length !== 0 &&
          users.map((u, i) => (
            <Item
              detail={true}
              function={[() => this.callBack(u.id)]}
              icon={[mdiPhone]}
              key={i}
              last={i === users.length - 1}
              {...this.getAvatar(u.partyNumber)}
              {...u}
            />
          ))}
      </Layout>
    );
  }
}

export default Recent;
