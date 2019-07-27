import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { createModelView } from 'redux-model';

import * as routerUtils from '../../mobx/routerStore';
import UI from './ui';

@observer
@createModelView(
  getter => (state, props) => ({
    call: getter.runningCalls.detailMapById(state)[props.match.params.call],
  }),
  action => emit => ({}),
)
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

export default View;
