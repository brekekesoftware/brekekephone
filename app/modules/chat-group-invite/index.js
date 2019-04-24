import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createModelView } from 'redux-model';
import createId from 'shortid';
import UI from './ui';

const mapGetter = getter => (state, props) => ({
  group: getter.chatGroups.detailMapById(state)[props.match.params.group],
  buddyIds: getter.ucUsers.idsByOrder(state),
  buddyById: getter.ucUsers.detailMapById(state),
});

const mapAction = action => emit => ({
  routeToGroupChatsRecent(group) {
    emit(action.router.goToGroupChatsRecent(group));
  },
  showToast(message) {
    emit(action.toasts.create({ id: createId(), message }));
  },
});

class View extends Component {
  static contextTypes = {
    uc: PropTypes.object.isRequired,
  };

  static defaultProps = {
    group: { members: [] },
    buddyIds: [],
    buddyById: {},
  };

  state = {
    selectedBuddy: {},
  };

  render = () => (
    <UI
      groupName={this.props.group.name}
      buddies={this.props.buddyIds.filter(this.isNotMember)}
      selectedBuddy={this.state.selectedBuddy}
      resolveBuddy={this.resolveBuddy}
      toggleBuddy={this.toggleBuddy}
      invite={this.invite}
      back={this.back}
    />
  );

  isNotMember = buddy => !this.props.group.members.includes(buddy);

  resolveBuddy = buddy => this.props.buddyById[buddy];

  toggleBuddy = buddy => {
    let { selectedBuddy } = this.state;
    selectedBuddy = { ...selectedBuddy, [buddy]: !selectedBuddy[buddy] };
    this.setState({ selectedBuddy });
  };

  invite = () => {
    const { group, showToast } = this.props;
    const { selectedBuddy } = this.state;
    const members = Object.keys(selectedBuddy);

    if (!members.length) {
      showToast('No buddy selectedBuddy');
      return;
    }

    const { uc } = this.context;
    uc.inviteChatGroupMembers(group.id, members)
      .catch(this.onInviteFailure)
      .then(this.back);
  };

  onInviteFailure = err => {
    console.error(err);
    const { showToast } = this.props;
    showToast(err.message || 'Failed with unknown error');
  };

  back = () => {
    const { group, routeToGroupChatsRecent } = this.props;
    routeToGroupChatsRecent(group.id);
  };
}

export default createModelView(mapGetter, mapAction)(View);
