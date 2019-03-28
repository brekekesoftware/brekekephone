import { createModelView } from 'redux-model';
import debounce from 'lodash.debounce';
import PropTypes from 'prop-types';
import React from 'react';
import createID from 'shortid';
import UserLanguage from '../../language/UserLanguage';
import UI from './ui';

class View extends React.Component {
  static contextTypes = {
    pbx: PropTypes.object.isRequired,
    sip: PropTypes.object.isRequired,
  };

  componentDidMount() {
    if (this.needToAuth()) {
      this.authCatched();
    }
  }
  componentDidUpdate() {
    if (this.needToAuth()) {
      this.authDebounced();
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
  auth = async () => {
    this.context.sip.disconnect();
    this.props.onStarted();
    //
    const pbxConfig = await this.context.pbx.getConfig();
    if (!pbxConfig) {
      throw new Error('Invalid PBX config');
    }
    //
    const sipWSSPort = pbxConfig['sip.wss.port'];
    if (!sipWSSPort) {
      throw new Error('Invalid SIP WSS port');
    }
    //
    const pbxUserConfig = await this.context.pbx.getUserForSelf(
      this.props.pbxTenant,
      this.props.pbxUsername,
    );
    if (!pbxUserConfig) {
      throw new Error('Invalid PBX user config');
    }
    //
    const language = pbxUserConfig.language;
    await UserLanguage.setUserzLanguage_s(language);
    //
    const userPhones = pbxUserConfig.phones;
    const isWebPhone = phone => !!phone.id && phone.type === 'Web Phone';
    // || phone.type === 'webrtc'
    // || phone.type === 'WebRTCs'
    const webPhone = userPhones.find(isWebPhone);
    if (!webPhone) {
      throw new Error('Web Phone not found');
    }
    //
    const sipAccessToken = await this.context.pbx.createSIPAccessToken(
      webPhone.id,
    );
    if (!sipAccessToken) {
      throw new Error('Invalid SIP access token');
    }
    const connectSipConfig = {
      hostname: this.props.pbxHostname,
      port: sipWSSPort,
      tenant: this.props.pbxTenant,
      username: webPhone.id,
      accessToken: sipAccessToken,
    };
    this.context.sip.connect(connectSipConfig);
    this.props.setAuthUserExtensionProperties(pbxUserConfig);
  };
  authCatched = () => {
    this.auth().catch(this.onAuthFailure);
  };
  authDebounced = debounce(this.authCatched, 5000, {
    maxWait: 60000,
  });

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
        abort={this.props.routeToProfilesManage}
        retry={this.authCatched}
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
  routeToProfilesManage() {
    emit(action.router.goToProfilesManage());
  },
  showToast(message) {
    emit(action.toasts.create({ id: createID(), message }));
  },
  setAuthUserExtensionProperties(properties) {
    emit(action.auth.setUserExtensionProperties(properties));
  },
});

export default createModelView(mapGetter, mapAction)(View);
