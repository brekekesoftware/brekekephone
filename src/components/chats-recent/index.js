import { observer } from 'mobx-react';
import React from 'react';
import { createModelView } from 'redux-model';

import ChatsHome from '../../components-Chats/Chats-Home';
import contactStore from '../../mobx/contactStore';
import routerStore from '../../mobx/routerStore';

const isGroupJointed = group => group.jointed;

@observer
@createModelView(
  getter => state => ({
    buddyIds: getter.buddyChats.buddyIdsByRecent(state),
    groupIds: getter.chatGroups
      .idsByOrder(state)
      .filter(id => isGroupJointed(getter.chatGroups.detailMapById(state)[id])),
    groupById: getter.chatGroups.detailMapById(state),
  }),
  action => emit => ({
    //
  }),
)
@observer
class View extends React.Component {
  static defaultProps = {
    buddyIds: [],
    groupIds: [],
    groupById: {},
  };

  render() {
    return (
      <ChatsHome
        buddyIds={this.getMatchIds()}
        buddyById={contactStore.ucUsers.reduce((m, u) => {
          m[u.id] = u;
          return m;
        }, {})}
        groupIds={this.props.groupIds}
        groupById={this.props.groupById}
        selectBuddy={routerStore.goToBuddyChatsRecent}
        selectGroup={routerStore.goToChatGroupsRecent}
        createGroup={routerStore.goToChatGroupsCreate}
        searchText={contactStore.searchText}
        setSearchText={contactStore.setFn('searchText')}
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
      ucUserName = '';
    }
    userId = userId.toLowerCase();
    ucUserName = ucUserName.toLowerCase();
    const txt = contactStore.searchText.toLowerCase();
    return userId.includes(txt) || ucUserName.includes(txt);
  };

  getMatchIds = () => this.props.buddyIds.filter(this.isMatchUser);
}

export default View;
