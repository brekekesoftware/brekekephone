import { observe } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import pbx from '../api/pbx';
import g from '../global';
import authStore from '../global/authStore';
import intl from '../intl/intl';

@observer
class AuthPBX extends React.Component {
  constructor() {
    // TODO notification login not work
    super();
    this.autoAuth();
    this.clearObserve = observe(authStore, `pbxShouldAuth`, this.autoAuth);
  }
  componentWillUnmount() {
    this.clearObserve();
    pbx.disconnect();
    authStore.set(`pbxState`, `stopped`);
  }
  auth = () => {
    pbx.disconnect();
    authStore.set(`pbxState`, `connecting`);
    pbx
      .connect(authStore.currentProfile)
      .then(() => {
        authStore.set(`pbxState`, `success`);
      })
      .catch(err => {
        authStore.set(`pbxState`, `failure`);
        g.showError({
          message: intl.debug`Failed to connect to pbx`,
          err,
        });
      });
  };
  autoAuth = () => authStore.pbxShouldAuth && this.auth();

  render() {
    return null;
  }
}

export default AuthPBX;
