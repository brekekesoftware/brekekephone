import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createModelView } from '@thenewvu/redux-model';
import UI from './ui';

const mapGetter = getter => (state, props) => ({
  call: getter.runningCalls.detailMapById(state)[props.match.params.call],
});

const mapAction = action => emit => ({
  routeToCallsManage() {
    emit(action.router.goToCallsManage());
  },
});

class View extends Component {
  static contextTypes = {
    sip: PropTypes.object.isRequired,
  };

  render = () => (
    <UI
      call={this.props.call}
      back={this.props.routeToCallsManage}
      sendKey={this.sendKey}
    />
  );

  sendKey = key => {
    const { sip } = this.context;
    sip.sendDTMF(key, this.props.call.id);
  };
}

export default createModelView(mapGetter, mapAction)(View);
