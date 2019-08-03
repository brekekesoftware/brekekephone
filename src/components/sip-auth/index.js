import { observe } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import getApiProvider from '../../apis/getApiProvider';
import authStore from '../../mobx/authStore';
import * as routerUtils from '../../mobx/routerStore';
import toast from '../../nativeModules/toast';
import UI from './ui';

@observer
class View extends React.Component {
  static contextTypes = {
    pbx: PropTypes.object.isRequired,
    sip: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.auth();
    this.clearObserve = observe(authStore, 'sipShouldAuth', this.auth);
  }

  componentWillUnmount() {
    this.clearObserve();
    this.context.sip.disconnect();
    authStore.set('sipState', 'stopped');
  }

  needToAuth = () => {
    return (
      authStore.pbxState === 'success' &&
      (!authStore.sipState || authStore.sipState === 'stopped')
    );
  };

  asyncGetWebPhone = () =>
    new Promise(resolve => {
      setTimeout(async () => {
        const api = getApiProvider();
        const phone = api && (await api.updatePhoneIndex());
        resolve(phone);
      }, 1000);
    });

  _auth = async () => {
    this.context.sip.disconnect();
    authStore.set('sipState', 'started');
    const pbxConfig = await this.context.pbx.getConfig();

    if (!pbxConfig) {
      console.error('Invalid PBX config');
      return;
    }

    const sipWSSPort = pbxConfig['sip.wss.port'];

    if (!sipWSSPort) {
      console.error('Invalid SIP WSS port');
      return;
    }

    const pbxUserConfig = await this.context.pbx.getUserForSelf(
      authStore.profile?.pbxTenant,
      authStore.profile?.pbxUsername,
    );

    if (!pbxUserConfig) {
      console.error('Invalid PBX user config');
      return;
    }

    authStore.userExtensionProperties = pbxUserConfig;
    const language = pbxUserConfig.language;
    void language;
    const webPhone = await this.asyncGetWebPhone();

    if (!webPhone) {
      return;
    }

    const sipAccessToken = await this.context.pbx.createSIPAccessToken(
      webPhone.id,
    );

    if (!sipAccessToken) {
      console.error('Invalid SIP access token');
      return;
    }

    const connectSipConfig = {
      hostname: authStore.profile?.pbxHostname,
      port: sipWSSPort,
      tenant: authStore.profile?.pbxTenant,
      username: webPhone.id,
      accessToken: sipAccessToken,
      turnEnabled: authStore.profile?.pbxTurnEnabled,
    };
    await this.context.sip.connect(connectSipConfig);
  };

  auth = () => {
    if (!authStore.sipShouldAuth) {
      return;
    }
    this._auth()
      .then(() => {
        authStore.set('sipState', 'success');
      })
      .catch(err => {
        authStore.set('sipState', 'failure');
        toast.error(`Failed to login to sip server, err: ${err?.message}`);
        console.error(err);
      });
  };

  render() {
    return authStore.sipState === 'success' ? null : (
      <UI
        retryable={!!authStore.profile}
        failure={!authStore.profile || authStore.sipState === 'failure'}
        abort={routerUtils.goToProfilesManage}
        retry={this.auth}
      />
    );
  }
}

export default View;
