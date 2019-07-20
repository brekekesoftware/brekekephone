import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { createModelView } from 'redux-model';

import * as routerUtils from '../../mobx/routerStore';
import UI from './ui';

const mapGetter = getter => (state, props) => ({
  call: getter.runningCalls.detailMapById(state)[props.match.params.call],
});

class View extends Component {
  static contextTypes = {
    sip: PropTypes.object.isRequired,
  };

  render = () => (
    <UI
      call={this.props.call}
      back={routerUtils.goToCallsManage}
      sendKey={this.sendKey}
    />
  );

  sendKey = key => {
    const { sip } = this.context;
    sip.sendDTMF(key, this.props.call.id);
  };
}

export default createModelView(mapGetter)(View);
