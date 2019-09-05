import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import { createModelView } from 'redux-model';

import contactStore from '../../mobx/contactStore';
import toast from '../../shared/Toast';
import UI from './ui';

const isNotJointed = group => !group.jointed;

@observer
@createModelView(
  getter => state => ({
    groupIds: getter.chatGroups
      .idsByOrder(state)
      .filter(id => isNotJointed(getter.chatGroups.detailMapById(state)[id])),
    groupById: getter.chatGroups.detailMapById(state),
  }),
  action => emit => ({
    removeChatGroup(id) {
      emit(action.chatGroups.remove(id));
    },
  }),
)
@observer
class View extends React.Component {
  static contextTypes = {
    uc: PropTypes.object.isRequired,
  };

  render() {
    return (
      <UI
        groups={this.props.groupIds}
        formatGroup={this.formatGroup}
        accept={this.accept}
        reject={this.reject}
      />
    );
  }

  formatGroup = id => {
    const { groupById } = this.props;

    const { inviter, name } = groupById[id];

    const inviterName = contactStore.getUCUser(inviter)?.name;

    return {
      name,
      inviter: inviterName || inviter,
    };
  };

  reject = group => {
    this.context.uc
      .leaveChatGroup(group)
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
