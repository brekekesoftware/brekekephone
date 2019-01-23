import React, { Component } from 'react';
import { createModelView } from '@thenewvu/redux-model';
import UI from './ui';

const isGroupJointed = group => group.jointed;

const mapGetter = getter => state => ({
  buddyIds: getter.buddyChats.buddyIdsByRecent(state),
  buddyById: getter.ucUsers.detailMapById(state),
  groupIds: getter.chatGroups
    .idsByOrder(state)
    .filter(id => isGroupJointed(getter.chatGroups.detailMapById(state)[id])),
  groupById: getter.chatGroups.detailMapById(state),
});

const mapAction = action => emit => ({
  routeToBuddyChatsRecent(buddy) {
    emit(action.router.goToBuddyChatsRecent(buddy));
  },
  routeToGroupChatsRecent(group) {
    emit(action.router.goToGroupChatsRecent(group));
  },
  routeToGroupChatsCreate() {
    emit(action.router.goToChatGroupsCreate());
  },
});

class View extends Component {
  render = () => (
    <UI
      buddyIds={this.props.buddyIds}
      buddyById={this.props.buddyById}
      groupIds={this.props.groupIds}
      groupById={this.props.groupById}
      selectBuddy={this.props.routeToBuddyChatsRecent}
      selectGroup={this.props.routeToGroupChatsRecent}
      createGroup={this.props.routeToGroupChatsCreate}
    />
  );
}

export default createModelView(mapGetter, mapAction)(View);
