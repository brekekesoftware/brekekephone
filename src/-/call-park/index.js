import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import g from '../../global';
import authStore from '../authStore';
import callStore from '../callStore';
import Toast from '../Toast';
import UI from './ui';

@observer
class View extends React.Component {
  static contextTypes = {
    pbx: PropTypes.object.isRequired,
  };
  state = {
    selectedPark: null,
  };

  render() {
    return (
      <UI
        call={callStore.getRunningCall(this.props.match.params.call)}
        parks={authStore.profile?.parks || []}
        selectedPark={this.state.selectedPark}
        selectPark={this.selectPark}
        park={this.park}
        back={g.goToCallsManage}
      />
    );
  }

  selectPark = selectedPark => {
    this.setState({
      selectedPark,
    });
  };

  park = () => {
    const { selectedPark } = this.state;

    if (!selectedPark) {
      Toast.error('No selected park');
      return;
    }

    const { pbx } = this.context;

    const call = callStore.getRunningCall(this.props.match.params.call);

    const tenant = call.pbxTenant;
    const talkerId = call.pbxTalkerId;
    pbx
      .parkTalker(tenant, talkerId, selectedPark)
      .then(this.onParkSuccess)
      .catch(this.onParkFailure);
  };

  onParkSuccess = () => {
    g.goToCallsManage();
  };

  onParkFailure = err => {
    Toast.error('Failed to park the call');
    console.error(err);
  };
}

export default View;
