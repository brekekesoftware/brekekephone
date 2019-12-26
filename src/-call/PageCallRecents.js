import { mdiPhone } from '@mdi/js';
import { observer } from 'mobx-react';
import React from 'react';

import UserItem from '../-contact/UserItem';
import sip from '../api/sip';
import g from '../global';
import authStore from '../global/authStore';
import callStore from '../global/callStore';
import contactStore from '../global/contactStore';
import Field from '../shared/Field';
import Layout from '../shared/Layout';
import Search from '../shared/Search';

@observer
class PageCallRecents extends React.Component {
  isMatchUser = call => {
    if (call.partyNumber.includes(contactStore.searchText)) {
      return call.id;
    }
  };
  callBack = id => {
    const number = authStore.currentProfile.recentCalls?.find(c => c.id === id)
      ?.partyNumber;
    if (number) {
      sip.createSession(number);
      g.goToPageCallManage();
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
    authStore.currentProfile.recentCalls?.filter(this.isMatchUser) || [];

  render() {
    const users = this.getMatchUserIds();
    return (
      <Layout
        footer={{
          navigation: {
            menu: `call`,
          },
        }}
        header={{
          description: `Recent voicemails and calls`,
          title: `Recents`,
          navigation: {
            menu: `call`,
            subMenu: `recents`,
          },
        }}
      >
        <Search
          onValueChange={contactStore.setF(`searchText`)}
          value={contactStore.searchText}
        />
        <Field
          isGroup
          label={`VOICEMAILS (${callStore.voicemail?.new || 0})`}
        />
        <Field isGroup label={`RECENT CALLS`} />
        {users.length !== 0 &&
          users.map((u, i) => (
            <UserItem
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

export default PageCallRecents;
