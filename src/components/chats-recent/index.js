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
    searchText: getter.usersBrowsing.searchText(state),
    groupIds: getter.chatGroups
      .idsByOrder(state)
      .filter(id => isGroupJointed(getter.chatGroups.detailMapById(state)[id])),
    groupById: getter.chatGroups.detailMapById(state),
  }),
  action => emit => ({
    setSearchText(value) {
      emit(action.usersBrowsing.setSearchText(value));
    },
  }),
)
@observer
class View extends React.Component {
  static defaultProps = {
    searchText: '',
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
        searchText={this.props.searchText}
        setSearchText={this.setSearchText}
      />
    );
  }

  setSearchText = value => {
    this.props.setSearchText(value);
  };

  isMatchUser = id => {
    if (!id) {
      return false;
    }
    const { searchText } = this.props;
    const userId = id && id.toLowerCase();
    let chatUserName;
    const chatUser = contactStore.getUCUser(id);
    if (chatUser) {
      chatUserName = chatUser.name.toLowerCase();
    } else {
      chatUserName = '';
    }
    return userId.includes(searchText) || chatUserName.includes(searchText);
  };

  getMatchIds = () => this.props.buddyIds.filter(this.isMatchUser);
}

export default View;
