import { observer } from 'mobx-react';
import React from 'react';
import { createModelView } from 'redux-model';

import ChatsHome from '../../components-Chats/Chats-Home';
import * as routerUtils from '../../mobx/routerStore';

const isGroupJointed = group => group.jointed;

@observer
@createModelView(
  getter => state => ({
    buddyIds: getter.buddyChats.buddyIdsByRecent(state),
    buddyById: getter.ucUsers.detailMapById(state),
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
  render = () => (
    <ChatsHome
      buddyIds={this.props.buddyIds}
      buddyById={this.props.buddyById}
      groupIds={this.props.groupIds}
      groupById={this.props.groupById}
      selectBuddy={routerUtils.goToBuddyChatsRecent}
      selectGroup={routerUtils.goToChatGroupsRecent}
      createGroup={routerUtils.goToChatGroupsCreate}
    />
  );
}

export default View;
