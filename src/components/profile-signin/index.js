import { observer } from 'mobx-react';
import React from 'react';
import { createModelView } from 'redux-model';

import authStore from '../../mobx/authStore';
import * as routerUtils from '../../mobx/routerStore';
import UI from './ui';

@observer
@createModelView(
  getter => (state, props) => ({
    profile: getter.profiles.detailMapById(state)[props.match.params.profile],
  }),
  action => emit => ({
    //
  }),
)
@observer
class View extends React.Component {
  state = {
    pbxPassword: this.props.profile ? this.props.profile.pbxPassword : '',
  };

  render = () => (
    <UI
      profile={this.props.profile}
      pbxPassword={this.state.pbxPassword}
      setPbxPassword={this.setPbxPassword}
      back={routerUtils.goToProfilesManage}
      signin={this.signin}
    />
  );

  setPbxPassword = pbxPassword => {
    this.setState({
      pbxPassword,
    });
  };

  signin = () => {
    let { profile } = this.props;

    profile.pbxPassword = this.state.pbxPassword;
    authStore.set('profile', profile);
    routerUtils.goToAuth();
  };
}

export default View;
