import { observer } from 'mobx-react';
import React from 'react';

import g from '../../global';
import { arrToMap } from '../../utils/toMap';
import chatStore from '../chatStore';
import ChatsHome from '../components-Chats/Chats-Home';
import contactStore from '../contactStore';

@observer
class View extends React.Component {
  render() {
    return (
      <ChatsHome
        buddyIds={this.getMatchIds()}
        buddyById={contactStore.ucUsers.reduce((m, u) => {
          m[u.id] = u;
          return m;
        }, {})}
        groupIds={chatStore.groups.filter(g => g.jointed).map(g => g.id)}
        groupById={arrToMap(chatStore.groups, `id`, g => g)}
        selectBuddy={g.goToBuddyChatsRecent}
        selectGroup={g.goToChatGroupsRecent}
        createGroup={g.goToChatGroupsCreate}
        searchText={contactStore.searchText}
        setSearchText={contactStore.setF(`searchText`)}
      />
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

export default View;
