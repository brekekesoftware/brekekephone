import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import { createModelView } from 'redux-model';

import PageRecents from '../../components-Recents/PageRecents';
import authStore from '../../mobx/authStore';
import * as routerUtils from '../../mobx/routerStore';

@observer
@createModelView(
  getter => state => ({
    ucUserById: getter.ucUsers.detailMapById(state),
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
    ucUserById: {},
  };

  render = () => (
    <PageRecents
      callIds={this.props.callIds}
      resolveCall={this.resolveCall}
      removeCall={this.props.removeCall}
      callBack={this.callBack}
      gotoCallsManage={routerUtils.goToCallsManage}
      gotoCallsCreate={routerUtils.goToCallsCreate}
      parkingIds={this.props.parkingIds}
      resolveUser={this.resolveUser}
    />
  );

  resolveCall = id => this.props.callById[id];

  callBack = id => {
    const { sip } = this.context;

    const { callById } = this.props;

    const call = callById[id] || {};
    const number = call.partyNumber;
    sip.createSession(number);
    routerUtils.goToCallsManage();
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
}

export default View;
