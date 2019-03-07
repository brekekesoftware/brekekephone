import React, { Component } from 'react';
import { createModelView } from 'redux-model';
import UI from './ui';

const mapGetter = getter => (state, props) => ({
  profile: getter.profiles.detailMapById(state)[props.match.params.profile],
});

const mapAction = action => emit => ({
  setAuthProfile(profile) {
    emit(action.auth.setProfile(profile));
  },
  routeToAuth() {
    emit(action.router.goToAuth());
  },
  routeToProfilesManage() {
    emit(action.router.goToProfilesManage());
  },
});

class View extends Component {
  state = {
    pbxPassword: this.props.profile ? this.props.profile.pbxPassword : '',
  };

  render = () => (
    <UI
      profile={this.props.profile}
      pbxPassword={this.state.pbxPassword}
      setPbxPassword={this.setPbxPassword}
      back={this.props.routeToProfilesManage}
      signin={this.signin}
    />
  );

  setPbxPassword = pbxPassword => {
    this.setState({ pbxPassword });
  };

  signin = () => {
    let { profile } = this.props;
    profile.pbxPassword = this.state.pbxPassword;
    this.props.setAuthProfile(profile);
    this.props.routeToAuth();
  };
}

export default createModelView(mapGetter, mapAction)(View);
