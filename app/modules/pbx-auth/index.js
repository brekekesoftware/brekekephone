import { createModelView } from 'redux-model';
import debounce from 'lodash.debounce';
import PropTypes from 'prop-types';
import React from 'react';
import createID from 'shortid';
import UI from './ui';

class View extends React.Component {
  static contextTypes = {
    pbx: PropTypes.object.isRequired,
  };
  componentDidMount() {
    if (this.needToAuth()) {
      this.auth();
    }
  }
  componentDidUpdate() {
    if (this.needToAuth()) {
      this.authDebounced();
    }
  }
  componentWillUnmount() {
    this.props.onStopped();
    this.context.pbx.disconnect();
  }

  needToAuth = () =>
    this.props.profile &&
    !this.props.started &&
    !this.props.success &&
    !this.props.failure;
  auth = () => {
    this.context.pbx.disconnect();
    this.props.onStarted();
    this.context.pbx
      .connect(this.props.profile)
      .then(this.onAuthSuccess)
      .catch(this.onAuthFailure);
  };
  authDebounced = debounce(this.auth, 5000, {
    maxWait: 60000,
  });

  onAuthSuccess = () => {
    this.props.onSuccess();
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
        abort={this.props.routeToProfilesManage}
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
    started: getter.auth.pbx.started(state),
    stopped: getter.auth.pbx.stopped(state),
    success: getter.auth.pbx.success(state),
    failure: getter.auth.pbx.failure(state),
    profile: {
      hostname: profile.pbxHostname,
      port: profile.pbxPort,
      tenant: profile.pbxTenant,
      username: profile.pbxUsername,
      password: profile.pbxPassword,
      parks: profile.parks,
      accessToken: profile.accessToken,
    },
  };
};

const mapAction = action => emit => ({
  onStarted() {
    emit(action.auth.pbx.onStarted());
  },
  onSuccess() {
    emit(action.auth.pbx.onSuccess());
  },
  onFailure() {
    emit(action.auth.pbx.onFailure());
  },
  onStopped() {
    emit(action.auth.pbx.onStopped());
  },
  routeToProfilesManage() {
    emit(action.router.goToProfilesManage());
  },
  showToast(message) {
    emit(action.toasts.create({ id: createID(), message }));
  },
});

export default createModelView(mapGetter, mapAction)(View);
