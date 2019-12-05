import React from 'react';

import chatStore from '../-/chatStore';
import contactStore from '../-/contactStore';
import UserItem from '../-contact/UserItem';
import g from '../global';
import { TouchableOpacity } from '../native/Rn';
import Layout from '../shared/Layout';
import Search from '../shared/Search';
import { arrToMap } from '../utils/toMap';
import ListUsers from './ListUsers';

class PageChatRecents extends React.Component {
  render() {
    return (
      <Layout
        footer={{
          navigation: {
            menu: `contact`,
          },
        }}
        header={{
          title: `Chat`,
          description: `UC recent active chat`,
          navigation: {
            menu: `contact`,
            subMenu: `chat`,
          },
        }}
      >
        <Search
          onValueChange={contactStore.setF(`searchText`)}
          value={contactStore.searchText}
        />

        <TouchableOpacity onPress={g.goToPageChatGroupCreate}>
          <UserItem name="Create group" />
        </TouchableOpacity>
        <ListUsers
          createGroup={g.goToPageChatGroupCreate}
          groupbyid={arrToMap(chatStore.groups, `id`, g => g)}
          groupids={chatStore.groups.filter(g => g.jointed).map(g => g.id)}
          groupselect={groupId => g.goToPageChatGroupDetail({ groupId })}
          lastmess={this.getLastMessageChat}
          userbyid={contactStore.ucUsers.reduce((m, u) => {
            m[u.id] = u;
            return m;
          }, {})}
          userids={this.getMatchIds()}
          userselect={id => g.goToPageChatDetail({ buddy: id })}
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

export default PageChatRecents;
