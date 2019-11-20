import { observe } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import g from '../../global';
import authStore from '../authStore';
import AuthPBXUI from './AuthPBXUI';

@observer
class AuthPBX extends React.Component {
  static contextTypes = {
    pbx: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.autoAuth();
    this.clearObserve = observe(authStore, `pbxShouldAuth`, this.autoAuth);
  }
  componentWillUnmount() {
    this.clearObserve();
    this.context.pbx.disconnect();
    authStore.set(`pbxState`, `stopped`);
  }

  auth = () => {
    this.context.pbx.disconnect();
    authStore.set(`pbxState`, `connecting`);
    this.context.pbx
      .connect(authStore.profile)
      .then(() => {
        authStore.set(`pbxState`, `success`);
      })
      .catch(err => {
        authStore.set(`pbxState`, `failure`);
        g.showError({ message: `login to pbx, err: ${err?.message}` });
      });
  };
  autoAuth = () => {
    if (!authStore.pbxShouldAuth) {
      return;
    }
    this.auth();
  };

  render() {
    return authStore.pbxState === `success` ? null : (
      <AuthPBXUI
        abort={g.goToPageProfileSignIn}
        failure={this.props.failure}
        retry={this.auth}
        retryable={!!authStore.profile}
      />
    );
  }
}

export default AuthPBX;
