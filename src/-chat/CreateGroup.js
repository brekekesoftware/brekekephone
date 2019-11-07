import { computed } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import chatStore from '../-/chatStore';
import contactStore from '../-/contactStore';
import g from '../global';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from '../native/Rn';
import FieldGroup from '../shared/FieldGroup';
import ItemUser from '../shared/ItemUser';
import Layout from '../shared/Layout';
import v from '../variables';

const s = StyleSheet.create({
  CreateGroup: {},
  CreateGroup_TextInput: {
    padding: 10,
    ...v.boxShadow,
  },
  CreateGroup_Outer: {
    paddingTop: 5,
    paddingHorizontal: 10,
  },
  CreateGroup_BtnSave: {
    marginTop: 15,
    padding: 10,
    borderRadius: v.borderRadius,
    backgroundColor: g.mainDarkBg,
  },
  CreateGroup_BtnText: {
    alignItems: `center`,
  },
  CreateGroup_Text: {
    paddingTop: 15,
    fontSize: v.fontSizeTitle,
  },
});

@observer
class CreateGroup extends React.Component {
  @computed get buddyIds() {
    return contactStore.ucUsers.map(u => u.id);
  }
  @computed get buddyById() {
    return contactStore.ucUsers.reduce((m, u) => {
      m[u.id] = u;
      return m;
    }, {});
  }

  static contextTypes = {
    uc: PropTypes.object.isRequired,
  };

  state = {
    name: ``,
    members: [],
  };

  render() {
    return (
      <Layout
        header={{
          onBackBtnPress: g.goToChatsRecent,
          title: `New Group`,
        }}
        footer={{}}
      >
        <View style={s.CreateGroup_Outer}>
          <TextInput
            style={s.CreateGroup_TextInput}
            placeholder="Group name"
            value={this.state.name}
            onChangeText={this.setName}
          />
          <TouchableOpacity style={s.CreateGroup_BtnSave} onPress={this.create}>
            <Text style={s.CreateGroup_BtnText}>SAVE</Text>
          </TouchableOpacity>
          <Text style={s.CreateGroup_Text}>Members</Text>
        </View>
        <React.Fragment>
          <FieldGroup>
            {this.buddyIds.map((id, i) => (
              <TouchableOpacity onPress={() => this.toggleBuddy(id)}>
                <ItemUser
                  last={i === this.buddyIds.length - 1}
                  key={id}
                  {...this.buddyById[id]}
                  selected={this.state.members.includes(id)}
                />
              </TouchableOpacity>
            ))}
          </FieldGroup>
        </React.Fragment>
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
    const { name, members } = this.state;

    if (!name.trim()) {
      g.showError({ message: `Group name is required` });
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
    g.goToChatsRecent();
  };

  onCreateFailure = err => {
    console.error(err);
    g.showError({ message: `create the group chat` });
  };
}

export default CreateGroup;
