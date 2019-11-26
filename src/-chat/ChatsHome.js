import React from 'react';

import chatStore from '../-/chatStore';
import contactStore from '../-/contactStore';
import g from '../global';
import { TouchableOpacity } from '../native/Rn';
import Item from '../shared/ItemUser';
import Layout from '../shared/Layout';
import Search from '../shared/Search';
import { arrToMap } from '../utils/toMap';
import ListUsers from './ListUsers';

class ChatsHome extends React.Component {
  render() {
    return (
      <Layout
        footer={{
          navigation: {
            menu: `contact`,
            subMenu: `chat`,
          },
        }}
        header={{
          title: `Chats`,
        }}
      >
        <Search
          onValueChange={contactStore.setF(`searchText`)}
          value={contactStore.searchText}
        />

        <TouchableOpacity onPress={g.goToChatGroupsCreate}>
          <Item name="Create group" />
        </TouchableOpacity>
        <ListUsers
          createGroup={g.goToChatGroupsCreate}
          groupbyid={arrToMap(chatStore.groups, `id`, g => g)}
          groupids={chatStore.groups.filter(g => g.jointed).map(g => g.id)}
          groupselect={groupId => g.goToChatGroupsRecent({ groupId })}
          lastmess={this.getLastMessageChat}
          userbyid={contactStore.ucUsers.reduce((m, u) => {
            m[u.id] = u;
            return m;
          }, {})}
          userids={this.getMatchIds()}
          userselect={id => g.goToBuddyChatsRecent({ buddy: id })}
        />
      </Layout>
    );
  }

  getLastMessageChat = id => {
    const chats = chatStore.messagesByThreadId[id] || [];
    return chats.length !== 0 ? chats[chats.length - 1] : {};
  };

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
