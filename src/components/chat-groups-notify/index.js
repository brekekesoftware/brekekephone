import at from 'lodash/get';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { createModelView } from 'redux-model';

import UI from './ui';
import toast from '../../nativeModules/toast';

const isNotJointed = group => !group.jointed;

@observer
@createModelView(
  getter => state => ({
    groupIds: getter.chatGroups
      .idsByOrder(state)
      .filter(id => isNotJointed(getter.chatGroups.detailMapById(state)[id])),
    groupById: getter.chatGroups.detailMapById(state),
    ucUserById: getter.ucUsers.detailMapById(state),
  }),
  action => emit => ({
    removeChatGroup(id) {
      emit(action.chatGroups.remove(id));
    },
  }),
)
class View extends Component {
  static contextTypes = {
    uc: PropTypes.object.isRequired,
  };

  render = () => (
    <UI
      groups={this.props.groupIds}
      formatGroup={this.formatGroup}
      accept={this.accept}
      reject={this.reject}
    />
  );

  formatGroup = id => {
    const { groupById, ucUserById } = this.props;

    const { inviter, name } = groupById[id];

    const inviterName = at(ucUserById, `${inviter}.name`);

    return {
      name,
      inviter: inviterName || inviter,
    };
  };

  reject = group => {
    this.context.uc.leaveChatGroup(group)
      .then(this.onRejectSuccess)
      .catch(this.onRejectFailure);
  };
  onRejectSuccess = res => {
    this.props.removeChatGroup(res.id);
  };
  onRejectFailure = err => {
    console.error(err);
    toast.error('Failed to reject the group chat');
  };

  accept = group => {
    this.context.uc.joinChatGroup(group).catch(this.onAcceptFailure);
  };
  onAcceptFailure = err => {
    console.error(err);
    toast.error('Failed to accept the group chat');
  };
}

export default View;
