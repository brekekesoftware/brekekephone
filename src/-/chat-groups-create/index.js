import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import g from '../../global';
import chatStore from '../chatStore';
import CreateGroup from '../components-Chats/Create-Group';
import contactStore from '../contactStore';
import routerStore from '../routerStore';

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
      g.showError({ message: 'Group name is required' });
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
    g.showError({ message: 'create the group chat' });
  };
}

export default View;
