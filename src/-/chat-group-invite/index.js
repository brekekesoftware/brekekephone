import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import chatStore from '../../---shared/chatStore';
import contactStore from '../../---shared/contactStore';
import routerStore from '../../---shared/routerStore';
import Toast from '../../---shared/Toast';
import UI from './ui';

@observer
class View extends React.Component {
  static contextTypes = {
    uc: PropTypes.object.isRequired,
  };

  state = {
    selectedBuddy: {},
  };

  render() {
    return (
      <UI
        groupName={chatStore.getGroup(this.props.match.params.group).name}
        buddies={contactStore.ucUsers.map(u => u.id).filter(this.isNotMember)}
        selectedBuddy={this.state.selectedBuddy}
        resolveBuddy={this.resolveBuddy}
        toggleBuddy={this.toggleBuddy}
        invite={this.invite}
        back={this.back}
      />
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
      Toast.error('No buddy selectedBuddy');
      return;
    }

    const { uc } = this.context;

    uc.inviteChatGroupMembers(this.props.match.params.group, members)
      .catch(this.onInviteFailure)
      .then(this.back);
  };

  onInviteFailure = err => {
    console.error(err);
    Toast.error(err.message || 'Failed with unknown error');
  };

  back = () => {
    routerStore.goToChatGroupsRecent(this.props.match.params.group);
  };
}

export default View;
