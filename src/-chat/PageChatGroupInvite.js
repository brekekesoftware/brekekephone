import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from '../-/Rn';
import UserItem from '../-contact/UserItem';
import uc from '../api/uc';
import g from '../global';
import chatStore from '../global/chatStore';
import contactStore from '../global/contactStore';
import intl from '../intl/intl';
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
      <Layout onBack={this.back} title={intl`Inviting Group Member`}>
        <View style={css.PageChatGroupInvite_Outer}>
          <Text style={css.PageChatGroupInvite_GroupName}>
            {chatStore.getGroup(this.props.groupId).name}
          </Text>
          <TouchableOpacity
            onPress={this.invite}
            style={css.PageChatGroupInvite_BtnSave}
          >
            <Text style={css.PageChatGroupInvite_BtnText}>{intl`Invite`}</Text>
          </TouchableOpacity>
          <Text style={css.PageChatGroupInvite_Text}>{intl`Members`}</Text>
        </View>
        <Field isGroup />
        {this.buddyIds.map((id, i) => (
          <TouchableOpacity key={i} onPress={() => this.toggleBuddy(id)}>
            <UserItem
              key={id}
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
      g.showError({
        message: intl.debug`No buddy selected`,
      });
      return;
    }
    uc.inviteChatGroupMembers(this.props.groupId, members)
      .catch(this.onInviteFailure)
      .then(this.back);
  };
  onInviteFailure = err => {
    g.showError({
      message: intl.debug`Failed to invite group chat`,
      err,
    });
  };
  back = () => {
    g.backToPageChatGroupDetail({ groupId: this.props.groupId });
  };
}

export default PageChatGroupInvite;
