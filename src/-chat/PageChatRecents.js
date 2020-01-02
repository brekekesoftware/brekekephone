import { mdiMagnify } from '@mdi/js';
import { observer } from 'mobx-react';
import React from 'react';

import UserItem from '../-contact/UserItem';
import g from '../global';
import chatStore from '../global/chatStore';
import contactStore from '../global/contactStore';
import { TouchableOpacity } from '../native/Rn';
import Field from '../shared/Field';
import Layout from '../shared/Layout';
import { arrToMap } from '../utils/toMap';
import ListUsers from './ListUsers';

@observer
class PageChatRecents extends React.Component {
  render() {
    return (
      <Layout
        description="UC recent active chat"
        menu="contact"
        subMenu="chat"
        title="Chat"
      >
        <Field
          icon={mdiMagnify}
          label="SEARCH NAME, PHONE NUMBER ..."
          onValueChange={v => {
            contactStore.usersSearchChat = v;
          }}
          value={contactStore.usersSearchChat}
        />

        <TouchableOpacity onPress={g.goToPageChatGroupCreate}>
          <UserItem name="Create group" />
        </TouchableOpacity>
        <Field isGroup label={`GROUP CHAT`} />
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
    const txt = contactStore.usersSearchChat.toLowerCase();
    return userId.includes(txt) || ucUserName.includes(txt);
  };

  getMatchIds = () =>
    chatStore.threadIdsOrderedByRecent.filter(this.isMatchUser);
}

export default PageChatRecents;
