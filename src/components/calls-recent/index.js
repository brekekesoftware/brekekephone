import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { createModelView } from 'redux-model';

import authStore from '../../mobx/authStore';
import * as routerUtils from '../../mobx/routerStore';
import UI from './ui';

const mapGetter = getter => state => ({
  callIds: getter.recentCalls.idsMapByProfile(state)[
    (authStore.profile || {}).id
  ],
  callById: getter.recentCalls.detailMapById(state),
  parkingIds: getter.parkingCalls.idsByOrder(state),
});

const mapAction = action => d => ({
  removeCall(id) {
    d(action.recentCalls.remove(id));
  },
});

class View extends Component {
  static contextTypes = {
    sip: PropTypes.object.isRequired,
  };

  static defaultProps = {
    callIds: [],
    callById: {},
  };

  render = () => (
    <UI
      callIds={this.props.callIds}
      resolveCall={this.resolveCall}
      removeCall={this.props.removeCall}
      callBack={this.callBack}
      gotoCallsManage={routerUtils.goToCallsManage}
      gotoCallsCreate={routerUtils.goToCallsCreate}
      parkingIds={this.props.parkingIds}
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
}

export default createModelView(mapGetter, mapAction)(View);
