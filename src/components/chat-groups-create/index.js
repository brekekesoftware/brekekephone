import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import CreateGroup from '../../components-Chats/Create-Group';
import chatStore from '../../mobx/chatStore';
import contactStore from '../../mobx/contactStore';
import routerStore from '../../mobx/routerStore';
import Toast from '../../shared/Toast';

@observer
class View extends React.Component {
  static contextTypes = {
    uc: PropTypes.object.isRequired,
  };

  state = {
    name: '',
    members: [],
  };

  render() {
    return (
      <CreateGroup
        buddyIds={contactStore.ucUsers.map(u => u.id)}
        buddyById={contactStore.ucUsers.reduce((m, u) => {
          m[u.id] = u;
          return m;
        }, {})}
        name={this.state.name}
        members={this.state.members}
        setName={this.setName}
        back={routerStore.goToChatsRecent}
        toggleBuddy={this.toggleBuddy}
        create={this.create}
      />
    );
  }

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
      Toast.error('Group name is required');
      return;
    }

    this.context.uc
      .createChatGroup(name, members)
      .then(this.onCreateSuccess)
      .catch(this.onCreateFailure);
  };

  onCreateSuccess = group => {
    chatStore.upsertGroup(group);
    this.context.uc.joinChatGroup(group.id);
    routerStore.goToChatsRecent();
  };

  onCreateFailure = err => {
    console.error(err);
    Toast.error('Failed to create the group chat');
  };
}

export default View;
