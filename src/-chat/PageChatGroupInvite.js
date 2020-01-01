import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import UserItem from '../-contact/UserItem';
import uc from '../api/uc';
import g from '../global';
import chatStore from '../global/chatStore';
import contactStore from '../global/contactStore';
import { StyleSheet, Text, TouchableOpacity, View } from '../native/Rn';
import Field from '../shared/Field';
import Layout from '../shared/Layout';

const css = StyleSheet.create({
  PageChatGroupInvite: {},
  PageChatGroupInvite_TextInput: {
    padding: 10,
    ...g.boxShadow,
  },
  PageChatGroupInvite_Outer: {
    paddingTop: 5,
    paddingHorizontal: 10,
  },
  PageChatGroupInvite_BtnSave: {
    marginTop: 15,
    padding: 10,
    borderRadius: g.borderRadius,
    backgroundColor: g.colors.primary,
  },
  PageChatGroupInvite_BtnText: {
    alignItems: `center`,
  },
  PageChatGroupInvite_GroupName: {
    fontSize: g.fontSizeTitle,
    padding: 5,
  },
  PageChatGroupInvite_Text: {
    paddingTop: 15,
    fontSize: g.fontSizeTitle,
  },
});

@observer
class PageChatGroupInvite extends React.Component {
  @computed get buddyIds() {
    return contactStore.ucUsers.map(u => u.id).filter(this.isNotMember);
  }
  state = {
    selectedBuddy: {},
  };

  render() {
    return (
      <Layout
        header={{
          onBackBtnPress: this.back,
          title: `Inviting Group member`,
        }}
      >
        <View style={css.PageChatGroupInvite_Outer}>
          <Text style={css.PageChatGroupInvite_GroupName}>
            {chatStore.getGroup(this.props.groupId).name}
          </Text>
          <TouchableOpacity
            onPress={this.invite}
            style={css.PageChatGroupInvite_BtnSave}
          >
            <Text style={css.PageChatGroupInvite_BtnText}>Invite</Text>
          </TouchableOpacity>
          <Text style={css.PageChatGroupInvite_Text}>Members</Text>
        </View>
        <Field isGroup />
        {this.buddyIds.map((id, i) => (
          <TouchableOpacity key={i} onPress={() => this.toggleBuddy(id)}>
            <UserItem
              key={id}
              last={i === this.buddyIds.length - 1}
              {...this.resolveBuddy(id)}
              selected={this.state.selectedBuddy[id]}
            />
          </TouchableOpacity>
        ))}
      </Layout>
    );
  }

  isNotMember = buddy =>
    !chatStore.getGroup(this.props.groupId).members?.includes(buddy);
  resolveBuddy = buddy => contactStore.getUCUser(buddy);
  toggleBuddy = buddy => {
    let { selectedBuddy } = this.state;
    selectedBuddy = {
      ...selectedBuddy,
      [buddy]: !selectedBuddy[buddy],
    };
    this.setState({
      selectedBuddy,
    });
  };

  invite = () => {
    const { selectedBuddy } = this.state;
    const members = Object.keys(selectedBuddy);
    if (!members.length) {
      g.showError({ message: `No buddy selectedBuddy` });
      return;
    }
    uc.inviteChatGroupMembers(this.props.groupId, members)
      .catch(this.onInviteFailure)
      .then(this.back);
  };
  onInviteFailure = err => {
    g.showError({ message: `invite group chat`, err });
  };
  back = () => {
    g.goToPageChatGroupDetail({ groupId: this.props.groupId });
  };
}

export default PageChatGroupInvite;
