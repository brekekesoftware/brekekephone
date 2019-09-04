import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import { createModelView } from 'redux-model';

import routerStore from '../../mobx/routerStore';
import UI from './ui';

@observer
@createModelView(
  getter => (state, props) => ({
    call: getter.runningCalls.detailMapById(state)[props.match.params.call],
  }),
  action => emit => ({
    //
  }),
)
@observer
class View extends React.Component {
  static contextTypes = {
    sip: PropTypes.object.isRequired,
  };

  render = () => (
    <UI
      call={this.props.call}
      back={routerStore.goToCallsManage}
      sendKey={this.sendKey}
    />
  );

  sendKey = key => {
    const { sip } = this.context;

    sip.sendDTMF(key, this.props.call.id);
  };
}

export default View;
