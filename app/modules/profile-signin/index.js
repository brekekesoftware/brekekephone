import React, { Component } from 'react';
import { createModelView } from 'redux-model';

import * as routerUtils from '../../mobx/routerStore';
import UI from './ui';

const mapGetter = getter => (state, props) => ({
  profile: getter.profiles.detailMapById(state)[props.match.params.profile],
});

const mapAction = action => emit => ({
  setAuthProfile(profile) {
    emit(action.auth.setProfile(profile));
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
      back={() => routerUtils.goToProfilesManage()}
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
    routerUtils.goToAuth();
  };
}

export default createModelView(mapGetter, mapAction)(View);
