import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createModelView } from 'redux-model';
import createID from 'shortid';
import at from 'lodash.get';
import UI from './ui';

const isNotJointed = group => !group.jointed;

const mapGetter = getter => state => ({
  groupIds: getter.chatGroups
    .idsByOrder(state)
    .filter(id => isNotJointed(getter.chatGroups.detailMapById(state)[id])),
  groupById: getter.chatGroups.detailMapById(state),
  ucUserById: getter.ucUsers.detailMapById(state),
});

const mapAction = action => emit => ({
  removeChatGroup(id) {
    emit(action.chatGroups.remove(id));
  },
  showToast(message) {
    emit(action.toasts.create({ id: createID(), message }));
  },
});

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
    return { name, inviter: inviterName || inviter };
  };

  reject = group => {
    const { uc } = this.context;
    uc.leaveChatGroup(group)
      .then(this.onRejectSuccess)
      .catch(this.onRejectFailure);
  };

  onRejectSuccess = res => {
    this.props.removeChatGroup(res.id);
  };

  onRejectFailure = err => {
    console.error(err);
    const { showToast } = this.props;
    showToast('Failed to reject the group chat');
  };

  accept = group => {
    const { uc } = this.context;
    uc.joinChatGroup(group).catch(this.onAcceptFailure);
  };

  onAcceptFailure = err => {
    console.error(err);
    const { showToast } = this.props;
    showToast('Failed to accept the group chat');
  };
}

export default createModelView(mapGetter, mapAction)(View);
