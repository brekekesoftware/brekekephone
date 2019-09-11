import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import callStore from '../../---shared/callStore';
import routerStore from '../../---shared/routerStore';
import UI from './ui';

@observer
class View extends React.Component {
  static contextTypes = {
    sip: PropTypes.object.isRequired,
  };

  render() {
    return (
      <UI
        call={callStore.getRunningCall(this.props.match.params.call)}
        back={routerStore.goToCallsManage}
        sendKey={this.sendKey}
      />
    );
  }

  sendKey = key => {
    const { sip } = this.context;

    sip.sendDTMF(key, this.props.match.params.call);
  };
}

export default View;
