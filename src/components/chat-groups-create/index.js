import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import { createModelView } from 'redux-model';

import * as routerUtils from '../../mobx/routerStore';
import toast from '../../nativeModules/toast';
import UI from './ui';

@observer
@createModelView(
  getter => state => ({
    buddyIds: getter.ucUsers.idsByOrder(state),
    buddyById: getter.ucUsers.detailMapById(state),
  }),
  action => emit => ({
    createChatGroup(group) {
      emit(action.chatGroups.create(group));
    },
  }),
)
@observer
class View extends React.Component {
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
    this.setState({
      name,
    });
  };

  toggleBuddy = buddy => {
    const { members } = this.state;

    if (members.includes(buddy)) {
      this.setState({
        members: members.filter(_ => _ !== buddy),
      });
    } else {
      this.setState({
        members: [...members, buddy],
      });
    }
  };

  create = () => {
    const { name, members } = this.state;

    if (!name.trim()) {
      toast.error('Group name is required');
      return;
    }

    this.context.uc
      .createChatGroup(name, members)
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
    toast.error('Failed to create the group chat');
  };
}

export default View;
