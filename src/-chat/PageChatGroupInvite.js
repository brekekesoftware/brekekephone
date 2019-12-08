import { computed } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import UserItem from '../-contact/UserItem';
import g from '../global';
import chatStore from '../global/chatStore';
import contactStore from '../global/contactStore';
import { StyleSheet, Text, TouchableOpacity, View } from '../native/Rn';
import Field from '../shared/Field';
import Layout from '../shared/Layout';
import v from '../variables';

const s = StyleSheet.create({
  PageChatGroupInvite: {},
  PageChatGroupInvite_TextInput: {
    padding: 10,
    ...v.boxShadow,
  },
  PageChatGroupInvite_Outer: {
    paddingTop: 5,
    paddingHorizontal: 10,
  },
  PageChatGroupInvite_BtnSave: {
    marginTop: 15,
    padding: 10,
    borderRadius: v.borderRadius,
    backgroundColor: g.mainDarkBg,
  },
  PageChatGroupInvite_BtnText: {
    alignItems: `center`,
  },
  PageChatGroupInvite_GroupName: {
    fontSize: v.fontSizeTitle,
    padding: 5,
  },
  PageChatGroupInvite_Text: {
    paddingTop: 15,
    fontSize: v.fontSizeTitle,
  },
});

@observer
class PageChatGroupInvite extends React.Component {
  @computed get buddyIds() {
    return contactStore.ucUsers.map(u => u.id).filter(this.isNotMember);
  }
  static contextTypes = {
    uc: PropTypes.object.isRequired,
  };

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
        <View style={s.PageChatGroupInvite_Outer}>
          <Text style={s.PageChatGroupInvite_GroupName}>
            {chatStore.getGroup(this.props.groupId).name}
          </Text>
          <TouchableOpacity
            onPress={this.invite}
            style={s.PageChatGroupInvite_BtnSave}
          >
            <Text style={s.PageChatGroupInvite_BtnText}>Invite</Text>
          </TouchableOpacity>
          <Text style={s.PageChatGroupInvite_Text}>Members</Text>
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

    const { uc } = this.context;

    uc.inviteChatGroupMembers(this.props.groupId, members)
      .catch(this.onInviteFailure)
      .then(this.back);
  };

  onInviteFailure = err => {
    console.error(err);
    g.showError({ message: err.message || `with unknown error` });
  };

  back = () => {
    g.goToPageChatGroupDetail({ groupId: this.props.groupId });
  };
}

export default PageChatGroupInvite;
