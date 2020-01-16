import { observer } from 'mobx-react';
import React from 'react';

import { Text } from '../-/Rn';
import g from '../global';
import chatStore from '../global/chatStore';
import contactStore from '../global/contactStore';
import Layout from '../shared/Layout';
import { arrToMap } from '../utils/toMap';
import ListUsers from './ListUsers';

@observer
class PageChatRecents extends React.Component {
  getLastChat = id => {
    const chats = chatStore.messagesByThreadId[id] || [];
    return chats.length !== 0 ? chats[chats.length - 1] : {};
  };
  render() {
    const groupIds = chatStore.groups
      .filter(g => g.jointed)
      .map(g => g.id)
      .filter(id => id);
    const userIds = chatStore.threadIdsOrderedByRecent.filter(id => id);
    return (
      <Layout
        description="UC recent active chat"
        dropdown={[
          {
            label: `Create group chat`,
            onPress: g.goToPageChatGroupCreate,
          },
        ]}
        menu="contact"
        subMenu="chat"
        title="Chat"
      >
        {!groupIds.length && !userIds.length && (
          <Text center normal small warning>
            There's no active chat thread
          </Text>
        )}
        <ListUsers
          getLastChat={this.getLastChat}
          groupById={arrToMap(chatStore.groups, `id`, g => g)}
          groupIds={groupIds}
          onGroupSelect={groupId => g.goToPageChatGroupDetail({ groupId })}
          onUserSelect={id => g.goToPageChatDetail({ buddy: id })}
          userById={arrToMap(contactStore.ucUsers, `id`, u => u)}
          userIds={userIds}
        />
      </Layout>
    );
  }
}

export default PageChatRecents;
