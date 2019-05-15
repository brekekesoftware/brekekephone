import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import React from 'react';
import { createModelView } from 'redux-model';
import createId from 'shortid';

import UCClient from '../../apis/ucclient';
import * as routerUtils from '../../mobx/routerStore';
import UI, { UC_CONNECT_STATES } from './ui';

class View extends React.Component {
  static contextTypes = {
    uc: PropTypes.object.isRequired,
  };

  state = {
    connectState: UC_CONNECT_STATES.NONE,
    didPleonasticLogin: false,
  };

  componentDidMount() {
    this._setStateForLifecycle(UC_CONNECT_STATES.NONE, false);
    this.context.uc.on('connection-stopped', this.onConnectionStopped);
    if (this.needToAutoAuth()) {
      this.auth();
    }
  }
  componentDidUpdate() {
    if (this.needToAutoAuth()) {
      this.authDebounced();
    }
  }
  componentWillUnmount() {
    this.context.uc.off('connection-stopped', this.onConnectionStopped);
    this.context.uc.disconnect();
    this._setStateForLifecycle(UC_CONNECT_STATES.NONE, false);
    this.props.onStopped();
    this.props.reinitBuddyChats();
    this.props.clearAllGroupChats();
    this.props.clearAllChatGroups();
  }

  // Set into `this` together with `setState` to avoid batch issue
  _setStateForLifecycle = (connectState, didPleonasticLogin) => {
    this._connectState = connectState;
    this._didPleonasticLogin = didPleonasticLogin;
    this.setState({
      connectState: connectState,
      didPleonasticLogin: didPleonasticLogin,
    });
  };
  _setConnectStateForLifecycle = connectState => {
    this._setStateForLifecycle(connectState, this._didPleonasticLogin);
  };

  needToAutoAuth = () => {
    if (!this.props.profile || !this.props.enabled) {
      return false;
    }
    if (this._connectState !== UC_CONNECT_STATES.NONE) {
      return false;
    }
    return true;
  };
  auth = () => {
    this.context.uc.disconnect();
    this.props.onStarted();
    this._setConnectStateForLifecycle(UC_CONNECT_STATES.CONNECTING);
    let option = undefined;
    if (this._didPleonasticLogin === true) {
      option = { modest: true };
    }
    this.context.uc
      .connect(this.props.profile, option)
      .then(this.onAuthSuccess)
      .catch(this.onAuthFailure);
  };
  authDebounced = debounce(this.auth, 5000, {
    maxWait: 60000,
  });

  onAuthSuccess = () => {
    this.props.onSuccess();
    this.loadUsers();
    this.loadUnreadChats();
    this._setConnectStateForLifecycle(UC_CONNECT_STATES.CONNECTED);
  };
  onAuthFailure = err => {
    let didPleonasticLogin = this._didPleonasticLogin;
    if (err && err.message) {
      this.props.showToast(err.message);
    }
    if (err && err.code === UCClient.Errors.ALREADY_SIGNED_IN) {
      didPleonasticLogin = false;
    }
    this.props.onFailure();
    this._setStateForLifecycle(
      UC_CONNECT_STATES.CONNECT_FAILED,
      didPleonasticLogin,
    );
  };

  onConnectionStopped = e => {
    const didPleonasticLogin = e.code === UCClient.Errors.PLEONASTIC_LOGIN;
    this._setStateForLifecycle(UC_CONNECT_STATES.NONE, didPleonasticLogin);
  };

  loadUsers = () => {
    const users = this.context.uc.getUsers();
    this.props.fillUsers(users);
  };

  loadUnreadChats = () => {
    this.context.uc
      .getUnreadChats()
      .then(this.onLoadUnreadChatsSuccess)
      .catch(this.onLoadUnreadChatsFailure);
  };
  onLoadUnreadChatsSuccess = chats => {
    chats.forEach(chat => {
      this.props.appendBuddyChats(chat.creator, [chat]);
    });
  };
  onLoadUnreadChatsFailure = err => {
    this.props.showToast('Failed to load unread chats');
    if (err && err.message) {
      this.props.showToast(err.message);
    }
  };

  render() {
    const connectState = this._connectState;
    if (connectState === UC_CONNECT_STATES.CONNECTED || !this.props.enabled) {
      return null;
    }
    return (
      <UI
        failure={this.props.failure}
        abort={routerUtils.goToProfilesManage}
        retry={this.auth}
        connectState={connectState}
      />
    );
  }
}

const mapGetter = getter => state => {
  const profile = getter.auth.profile(state);
  if (!profile) {
    return { enabled: false };
  }
  return {
    enabled: profile.ucEnabled,
    started: getter.auth.uc.started(state),
    stopped: getter.auth.uc.stopped(state),
    success: getter.auth.uc.success(state),
    failure: getter.auth.uc.failure(state),
    profile: {
      hostname: profile.ucHostname,
      port: profile.ucPort,
      tenant: profile.pbxTenant,
      username: profile.pbxUsername,
      password: profile.pbxPassword,
      webRtcType: profile.pbxWebRtcType,
    },
  };
};

const mapAction = action => emit => ({
  onStarted() {
    emit(action.auth.uc.onStarted());
  },
  onSuccess() {
    emit(action.auth.uc.onSuccess());
  },
  onFailure() {
    emit(action.auth.uc.onFailure());
  },
  onStopped() {
    emit(action.auth.uc.onStopped());
  },
  fillUsers(users) {
    emit(action.ucUsers.refill(users));
  },
  showToast(message) {
    emit(action.toasts.create({ id: createId(), message }));
  },
  appendBuddyChats(buddy, chats) {
    emit(action.buddyChats.appendByBuddy(buddy, chats));
  },
  reinitBuddyChats() {
    emit(action.buddyChats.clearAll());
  },
  clearAllGroupChats() {
    emit(action.groupChats.clearAll());
  },
  clearAllChatGroups() {
    emit(action.chatGroups.clearAll());
  },
});

export default createModelView(mapGetter, mapAction)(View);
