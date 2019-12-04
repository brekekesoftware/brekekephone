import { observe } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import g from '../../global';
import authStore from '../authStore';
import getApiProvider from './getApiProvider';

@observer
class AuthSIP extends React.Component {
  static contextTypes = {
    pbx: PropTypes.object.isRequired,
    sip: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.autoAuth();
    this.clearObserve = observe(authStore, `sipShouldAuth`, this.autoAuth);
  }
  componentWillUnmount() {
    this.clearObserve();
    this.context.sip.disconnect();
    authStore.set(`sipState`, `stopped`);
  }

  getWebPhone = () =>
    new Promise(resolve => {
      setTimeout(async () => {
        const api = getApiProvider();
        const phone = api && (await api.updatePhoneIndex());
        resolve(phone);
      }, 1000);
    });

  _auth = async () => {
    this.context.sip.disconnect();
    authStore.set(`sipState`, `connecting`);
    //
    const pbxConfig = await this.context.pbx.getConfig();
    if (!pbxConfig) {
      console.error(`Invalid PBX config`);
      return;
    }
    //
    const sipWSSPort = pbxConfig[`sip.wss.port`];
    if (!sipWSSPort) {
      console.error(`Invalid SIP WSS port`);
      return;
    }
    //
    const pbxUserConfig = await this.context.pbx.getUserForSelf(
      authStore.profile?.pbxTenant,
      authStore.profile?.pbxUsername,
    );
    if (!pbxUserConfig) {
      console.error(`Invalid PBX user config`);
      return;
    }
    authStore.userExtensionProperties = pbxUserConfig;
    //
    const language = pbxUserConfig.language;
    void language;
    //
    const webPhone = await this.getWebPhone();
    if (!webPhone) {
      return;
    }
    //
    const sipAccessToken = await this.context.pbx.createSIPAccessToken(
      webPhone.id,
    );
    if (!sipAccessToken) {
      console.error(`Invalid SIP access token`);
      return;
    }
    //
    await this.context.sip.connect({
      hostname: authStore.profile?.pbxHostname,
      port: sipWSSPort,
      tenant: authStore.profile?.pbxTenant,
      username: webPhone.id,
      accessToken: sipAccessToken,
      pbxTurnEnabled: authStore.profile?.pbxTurnEnabled,
    });
  };
  auth = () => {
    this._auth()
      .then(() => {
        authStore.set(`sipState`, `success`);
      })
      .catch(err => {
        authStore.set(`sipState`, `failure`);
        g.showError({ message: `login to sip server, err: ${err?.message}` });
        console.error(err);
      });
  };
  autoAuth = () => {
    if (!authStore.sipShouldAuth) {
      return;
    }
    this.auth();
  };

  render() {
    return null;
  }
}

export default AuthSIP;
