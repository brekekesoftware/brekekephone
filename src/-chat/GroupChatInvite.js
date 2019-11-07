import { computed } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import chatStore from '../-/chatStore';
import contactStore from '../-/contactStore';
import g from '../global';
import { StyleSheet, Text, TouchableOpacity, View } from '../native/Rn';
import FieldGroup from '../shared/FieldGroup';
import ItemUser from '../shared/ItemUser';
import Layout from '../shared/Layout';
import v from '../variables';

const s = StyleSheet.create({
  GroupInvite: {},
  GroupInvite_TextInput: {
    padding: 10,
    ...v.boxShadow,
  },
  GroupInvite_Outer: {
    paddingTop: 5,
    paddingHorizontal: 10,
  },
  GroupInvite_BtnSave: {
    marginTop: 15,
    padding: 10,
    borderRadius: v.borderRadius,
    backgroundColor: g.mainDarkBg,
  },
  GroupInvite_BtnText: {
    alignItems: `center`,
  },
  GroupInvite_GroupName: {
    fontSize: v.fontSizeTitle,
    padding: 5,
  },
  GroupInvite_Text: {
    paddingTop: 15,
    fontSize: v.fontSizeTitle,
  },
});

@observer
class GroupChatInvite extends React.Component {
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
        footer={{}}
      >
        <View style={s.GroupInvite_Outer}>
          <Text style={s.GroupInvite_GroupName}>
            {chatStore.getGroup(this.props.match.params.group).name}
          </Text>
          <TouchableOpacity style={s.GroupInvite_BtnSave} onPress={this.invite}>
            <Text style={s.GroupInvite_BtnText}>Invite</Text>
          </TouchableOpacity>
          <Text style={s.GroupInvite_Text}>Members</Text>
        </View>
        <React.Fragment>
          <FieldGroup>
            {this.buddyIds.map((id, i) => (
              <TouchableOpacity onPress={() => this.toggleBuddy(id)}>
                <ItemUser
                  last={i === this.buddyIds.length - 1}
                  key={id}
                  {...this.resolveBuddy(id)}
                  selected={this.state.selectedBuddy[id]}
                />
              </TouchableOpacity>
            ))}
          </FieldGroup>
        </React.Fragment>
      </Layout>
    );
  }

  isNotMember = buddy =>
    !chatStore.getGroup(this.props.match.params.group).members?.includes(buddy);
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

    uc.inviteChatGroupMembers(this.props.match.params.group, members)
      .catch(this.onInviteFailure)
      .then(this.back);
  };

  onInviteFailure = err => {
    console.error(err);
    g.showError({ message: err.message || `with unknown error` });
  };

  back = () => {
    g.goToChatGroupsRecent(this.props.match.params.group);
  };
}

export default GroupChatInvite;
