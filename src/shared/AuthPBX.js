import { observe } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import pbx from '../api/pbx';
import g from '../global';
import authStore from '../global/authStore';

@observer
class AuthPBX extends React.Component {
  componentDidMount() {
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
    return null;
  }
}

export default AuthPBX;
