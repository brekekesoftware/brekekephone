import React, { Component } from 'react';
import { createModelView } from 'redux-model';

import * as routerUtils from '../../mobx/routerStore';
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

class View extends Component {
  render = () => (
    <UI
      buddyIds={this.props.buddyIds}
      buddyById={this.props.buddyById}
      groupIds={this.props.groupIds}
      groupById={this.props.groupById}
      selectBuddy={routerUtils.goToBuddyChatsRecent}
      selectGroup={routerUtils.goToGroupChatsRecent}
      createGroup={routerUtils.goToGroupChatsCreate}
    />
  );
}

export default createModelView(mapGetter)(View);
