import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import { createModelView } from 'redux-model';

import PageRecents from '../../components-Recents/PageRecents';
import authStore from '../../mobx/authStore';
import callStore from '../../mobx/callStore';
import contactStore from '../../mobx/contactStore';
import routerStore from '../../mobx/routerStore';

@observer
@createModelView(
  getter => state => ({
    callIds: getter.recentCalls.idsMapByProfile(state)[
      (authStore.profile || {}).id
    ],
    callById: getter.recentCalls.detailMapById(state),
  }),
  action => d => ({
    removeCall(id) {
      d(action.recentCalls.remove(id));
    },
  }),
)
@observer
class View extends React.Component {
  static contextTypes = {
    sip: PropTypes.object.isRequired,
  };

  static defaultProps = {
    callIds: [],
    callById: {},
  };

  render() {
    return (
      <PageRecents
        resolveCall={this.resolveCall}
        removeCall={this.props.removeCall}
        callBack={this.callBack}
        gotoCallsManage={routerStore.goToCallsManage}
        gotoCallsCreate={routerStore.goToCallsCreate}
        parkingIds={callStore.runnings.filter(c => c.parking).map(c => c.id)}
        resolveUser={this.resolveUser}
        searchText={contactStore.searchText}
        setSearchText={contactStore.setFn('searchText')}
        callIds={this.getMatchUserIds()}
      />
    );
  }

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
    const ucUser = contactStore.getUCUser(id) || {};
    return {
      avatar: ucUser.avatar,
      status: ucUser.status,
    };
  };

  isMatchUser = id => {
    if (!id) {
      return false;
    }
    const { callById } = this.props;
    const callUser = callById[id];
    if (callUser.partyNumber.includes(contactStore.searchText)) {
      return callUser.id;
    }
  };

  getMatchUserIds = () => this.props.callIds.filter(this.isMatchUser);
}

export default View;
