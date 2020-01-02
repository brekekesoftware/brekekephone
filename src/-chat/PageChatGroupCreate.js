import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import UserItem from '../-contact/UserItem';
import uc from '../api/uc';
import g from '../global';
import chatStore from '../global/chatStore';
import contactStore from '../global/contactStore';
import { TouchableOpacity } from '../native/Rn';
import Field from '../shared/Field';
import Layout from '../shared/Layout';

@observer
class PageChatGroupCreate extends React.Component {
  @computed get buddyIds() {
    return contactStore.ucUsers.map(u => u.id);
  }
  @computed get buddyById() {
    return contactStore.ucUsers.reduce((m, u) => {
      m[u.id] = u;
      return m;
    }, {});
  }

  state = {
    name: ``,
    members: [],
  };

  render() {
    return (
      <Layout
        onBack={g.goToPageChatRecents}
        onFabBack={g.goToPageChatRecents}
        onFabNext={this.create}
        title="New Group"
      >
        <Field
          label="GROUP NAME"
          onValueChange={this.setName}
          type={`inputElement`}
          value={this.state.name}
        />
        <Field isGroup label={`Members`} />
        {this.buddyIds.map((id, i) => (
          <TouchableOpacity key={i} onPress={() => this.toggleBuddy(id)}>
            <UserItem
              key={id}
              last={i === this.buddyIds.length - 1}
              {...this.buddyById[id]}
              selected={this.state.members.includes(id)}
            />
          </TouchableOpacity>
        ))}
      </Layout>
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
    const { members, name } = this.state;
    if (!name.trim()) {
      g.showError({ message: `Group name is required` });
      return;
    }
    uc.createChatGroup(name, members)
      .then(this.onCreateSuccess)
      .catch(this.onCreateFailure);
  };
  onCreateSuccess = group => {
    chatStore.upsertGroup(group);
    uc.joinChatGroup(group.id);
    g.goToPageChatRecents();
  };
  onCreateFailure = err => {
    g.showError({ message: `create the group chat`, err });
  };
}
export default PageChatGroupCreate;
