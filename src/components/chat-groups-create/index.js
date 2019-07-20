import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { createModelView } from 'redux-model';
import createId from 'shortid';

import * as routerUtils from '../../mobx/routerStore';
import UI from './ui';

const mapGetter = getter => state => ({
  buddyIds: getter.ucUsers.idsByOrder(state),
  buddyById: getter.ucUsers.detailMapById(state),
});

const mapAction = action => emit => ({
  showToast(message) {
    emit(action.toasts.create({ id: createId(), message }));
  },
  createChatGroup(group) {
    emit(action.chatGroups.create(group));
  },
});

class View extends Component {
  static contextTypes = {
    uc: PropTypes.object.isRequired,
  };

  state = {
    name: '',
    members: [],
  };

  render = () => (
    <UI
      buddyIds={this.props.buddyIds}
      buddyById={this.props.buddyById}
      name={this.state.name}
      members={this.state.members}
      setName={this.setName}
      back={routerUtils.goToChatsRecent}
      toggleBuddy={this.toggleBuddy}
      create={this.create}
    />
  );

  setName = name => {
    this.setState({ name });
  };

  toggleBuddy = buddy => {
    const { members } = this.state;
    if (members.includes(buddy)) {
      this.setState({ members: members.filter(_ => _ !== buddy) });
    } else {
      this.setState({ members: [...members, buddy] });
    }
  };

  create = () => {
    const { name, members } = this.state;
    const { showToast } = this.props;
    if (!name.trim()) {
      showToast('Group name is required');
      return;
    }

    const { uc } = this.context;
    uc.createChatGroup(name, members)
      .then(this.onCreateSuccess)
      .catch(this.onCreateFailure);
  };

  onCreateSuccess = group => {
    this.props.createChatGroup(group);
    this.context.uc.joinChatGroup(group.id);
    routerUtils.goToChatsRecent();
  };

  onCreateFailure = err => {
    console.error(err);
    const { showToast } = this.props;
    showToast('Failed to create the group chat');
  };
}

export default createModelView(mapGetter, mapAction)(View);
