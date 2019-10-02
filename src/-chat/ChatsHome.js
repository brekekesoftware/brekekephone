import React from 'react';

import chatStore from '../-/chatStore';
import contactStore from '../-/contactStore';
import g from '../global';
import Layout from '../shared/Layout';
import Search from '../shared/Search';
import { arrToMap } from '../utils/toMap';
import ListUsers from './ListUsers';

class ChatsHome extends React.Component {
  render() {
    return (
      <Layout
        header={{
          title: `Chats`,
        }}
      >
        <Search
          value={contactStore.searchText}
          onValueChange={contactStore.setF(`searchText`)}
        />
        <ListUsers
          userids={this.getMatchIds()}
          userbyid={contactStore.ucUsers.reduce((m, u) => {
            m[u.id] = u;
            return m;
          }, {})}
          userselect={g.goToBuddyChatsRecent}
          createGroup={g.goToChatGroupsCreate}
          groupids={chatStore.groups.filter(g => g.jointed).map(g => g.id)}
          groupbyid={arrToMap(chatStore.groups, `id`, g => g)}
          groupselect={g.goToChatGroupsRecent}
        />
      </Layout>
    );
  }

  isMatchUser = id => {
    if (!id) {
      return false;
    }
    let userId = id;
    let ucUserName;
    const chatUser = contactStore.getUCUser(id);
    if (chatUser) {
      ucUserName = chatUser.name.toLowerCase();
    } else {
      ucUserName = ``;
    }
    userId = userId.toLowerCase();
    ucUserName = ucUserName.toLowerCase();
    const txt = contactStore.searchText.toLowerCase();
    return userId.includes(txt) || ucUserName.includes(txt);
  };

  getMatchIds = () =>
    chatStore.threadIdsOrderedByRecent.filter(this.isMatchUser);
}

export default ChatsHome;
