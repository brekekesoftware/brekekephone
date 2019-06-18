import PropTypes from 'prop-types';
import React from 'react';
import { createModelView } from 'redux-model';
import createId from 'shortid';

import getApiProvider from '../../apis/getApiProvider';
import * as routerUtils from '../../mobx/routerStore';
import UI from './ui';

class View extends React.Component {
  static contextTypes = {
    pbx: PropTypes.object.isRequired,
    sip: PropTypes.object.isRequired,
  };

  componentDidMount() {
    if (this.needToAuth()) {
      this.auth();
    }
  }
  componentDidUpdate() {
    if (this.needToAuth()) {
      this.auth();
    }
  }
  componentWillUnmount() {
    this.props.onStopped();
    this.context.sip.disconnect();
  }

  needToAuth = () =>
    this.props.pbxSuccess &&
    !this.props.started &&
    !this.props.success &&
    !this.props.failure;
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
    this.props.onStarted();
    //
    const pbxConfig = await this.context.pbx.getConfig();
    if (!pbxConfig) {
      console.error('Invalid PBX config');
      return;
    }
    //
    const sipWSSPort = pbxConfig['sip.wss.port'];
    if (!sipWSSPort) {
      console.error('Invalid SIP WSS port');
      return;
    }
    //
    const pbxUserConfig = await this.context.pbx.getUserForSelf(
      this.props.pbxTenant,
      this.props.pbxUsername,
    );
    if (!pbxUserConfig) {
      console.error('Invalid PBX user config');
      return;
    }
    this.props.setAuthUserExtensionProperties(pbxUserConfig);
    //
    const language = pbxUserConfig.language;
    void language; // TODO update language
    //
    const webPhone = await this.asyncGetWebPhone();
    if (!webPhone) {
      return;
    }
    //
    const sipAccessToken = await this.context.pbx.createSIPAccessToken(
      webPhone.id,
    );
    if (!sipAccessToken) {
      console.error('Invalid SIP access token');
      return;
    }
    const connectSipConfig = {
      hostname: this.props.pbxHostname,
      port: sipWSSPort,
      tenant: this.props.pbxTenant,
      username: webPhone.id,
      accessToken: sipAccessToken,
      turnEnabled: this.props.pbxTurnEnabled,
    };
    await this.context.sip.connect(connectSipConfig);
  };
  auth = () => {
    this._auth().catch(this.onAuthFailure);
  };

  onAuthFailure = err => {
    if (err && err.message) {
      this.props.showToast(err.message);
    }
    this.props.onFailure();
  };

  render() {
    return this.props.success ? null : (
      <UI
        retryable={this.props.retryable}
        failure={this.props.failure}
        abort={routerUtils.goToProfilesManage}
        retry={this.auth}
      />
    );
  }
}

const mapGetter = getter => state => {
  const profile = getter.auth.profile(state);
  if (!profile) {
    return { retryable: false, failure: true };
  }
  return {
    retryable: true,
    pbxSuccess: getter.auth.pbx.success(state),
    pbxHostname: profile.pbxHostname,
    pbxTenant: profile.pbxTenant,
    pbxUsername: profile.pbxUsername,
    pbxPhoneIndex: profile.pbxPhoneIndex,
    pbxTurnEnabled: profile.pbxTurnEnabled,
    accessToken: profile.accessToken,
    started: getter.auth.sip.started(state),
    stopped: getter.auth.sip.stopped(state),
    success: getter.auth.sip.success(state),
    failure: getter.auth.sip.failure(state),
  };
};

const mapAction = action => emit => ({
  onStarted() {
    emit(action.auth.sip.onStarted());
  },
  onFailure() {
    emit(action.auth.sip.onFailure());
  },
  onStopped() {
    emit(action.auth.sip.onStopped());
  },
  showToast(message) {
    emit(action.toasts.create({ id: createId(), message }));
  },
  setAuthUserExtensionProperties(properties) {
    emit(action.auth.setUserExtensionProperties(properties));
  },
});

export default createModelView(mapGetter, mapAction)(View);
