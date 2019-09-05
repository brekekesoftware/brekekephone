import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import { createModelView } from 'redux-model';

import authStore from '../../mobx/authStore';
import routerStore from '../../mobx/routerStore';
import toast from '../../shared/Toast';
import UI from './ui';

@observer
@createModelView(
  getter => (state, props) => {
    const callId = props.match.params.call;
    const call = getter.runningCalls.detailMapById(state)[callId];
    const profile = authStore.profile;
    const parks = profile ? profile.parks : [];

    return {
      call,
      parks,
    };
  },
  action => emit => ({
    //
  }),
)
@observer
class View extends React.Component {
  static contextTypes = {
    pbx: PropTypes.object.isRequired,
  };

  static defaultProps = {
    parks: [],
  };

  state = {
    selectedPark: null,
  };

  render() {
    return (
      <UI
        call={this.props.call}
        parks={this.props.parks}
        selectedPark={this.state.selectedPark}
        selectPark={this.selectPark}
        park={this.park}
        back={routerStore.goToCallsManage}
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
      toast.error('No selected park');
      return;
    }

    const { pbx } = this.context;

    const { call } = this.props;

    const tenant = call.pbxTenant;
    const talkerId = call.pbxTalkerId;
    pbx
      .parkTalker(tenant, talkerId, selectedPark)
      .then(this.onParkSuccess)
      .catch(this.onParkFailure);
  };

  onParkSuccess = () => {
    routerStore.goToCallsManage();
  };

  onParkFailure = err => {
    toast.error('Failed to park the call');
    console.error(err);
  };
}

export default View;
