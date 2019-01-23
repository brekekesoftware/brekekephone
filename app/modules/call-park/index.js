import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createModelView } from '@thenewvu/redux-model';
import createID from 'shortid';
import UI from './ui';

const mapGetter = getter => (state, props) => {
  const callId = props.match.params.call;
  const call = getter.runningCalls.detailMapById(state)[callId];
  const profile = getter.auth.profile(state);
  const parks = profile ? profile.parks : [];
  return { call, parks };
};

const mapAction = action => emit => ({
  routeToCallsManage() {
    emit(action.router.goToCallsManage());
  },
  showToast(message) {
    emit(action.toasts.create({ id: createID(), message }));
  },
});

class View extends Component {
  static contextTypes = {
    pbx: PropTypes.object.isRequired,
  };

  static defaultProps = {
    parks: [],
  };

  state = {
    selectedPark: null,
  };

  render = () => (
    <UI
      call={this.props.call}
      parks={this.props.parks}
      selectedPark={this.state.selectedPark}
      selectPark={this.selectPark}
      park={this.park}
      back={this.props.routeToCallsManage}
    />
  );

  selectPark = selectedPark => {
    this.setState({ selectedPark });
  };

  park = () => {
    const { selectedPark } = this.state;

    if (!selectedPark) {
      this.props.showToast('No selected park');
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
    this.props.routeToCallsManage();
  };

  onParkFailure = err => {
    this.props.showToast('Failed to park the call');
    console.error(err);
  };
}

export default createModelView(mapGetter, mapAction)(View);
