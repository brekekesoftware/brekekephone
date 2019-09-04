import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import { createModelView } from 'redux-model';

import PageRecents from '../../components-Recents/PageRecents';
import authStore from '../../mobx/authStore';
import routerStore from '../../mobx/routerStore';

@observer
@createModelView(
  getter => state => ({
    ucUserById: getter.ucUsers.detailMapById(state),
    searchText: getter.usersBrowsing.searchText(state),
    callIds: getter.recentCalls.idsMapByProfile(state)[
      (authStore.profile || {}).id
    ],
    callById: getter.recentCalls.detailMapById(state),
    parkingIds: getter.parkingCalls.idsByOrder(state),
  }),
  action => d => ({
    removeCall(id) {
      d(action.recentCalls.remove(id));
    },
    setSearchText(value) {
      d(action.usersBrowsing.setSearchText(value));
    },
  }),
)
@observer
class View extends React.Component {
  static contextTypes = {
    sip: PropTypes.object.isRequired,
  };

  static defaultProps = {
    searchText: '',
    callIds: [],
    callById: {},
    ucUserById: {},
  };

  render = () => (
    <PageRecents
      resolveCall={this.resolveCall}
      removeCall={this.props.removeCall}
      callBack={this.callBack}
      gotoCallsManage={routerStore.goToCallsManage}
      gotoCallsCreate={routerStore.goToCallsCreate}
      parkingIds={this.props.parkingIds}
      resolveUser={this.resolveUser}
      searchText={this.props.searchText}
      setSearchText={this.setSearchText}
      callIds={this.getMatchUserIds()}
    />
  );

  resolveCall = id => this.props.callById[id];

  callBack = id => {
    const { sip } = this.context;

    const { callById } = this.props;

    const call = callById[id] || {};
    const number = call.partyNumber;
    sip.createSession(number);
    routerStore.goToCallsManage();
  };

  resolveUser = id => {
    const { ucUserById } = this.props;
    const ucUser = ucUserById[id] || {};
    return {
      avatar: ucUser.avatar,
      online: ucUser.online,
      offline: ucUser.offline,
      idle: ucUser.idle,
      busy: ucUser.busy,
    };
  };

  setSearchText = value => {
    this.props.setSearchText(value);
  };

  isMatchUser = id => {
    if (!id) {
      return false;
    }
    const { callById, searchText } = this.props;
    const callUser = callById[id];
    if (callUser.partyNumber.includes(searchText)) {
      return callUser.id;
    }
  };

  getMatchUserIds = () => this.props.callIds.filter(this.isMatchUser);
}

export default View;
