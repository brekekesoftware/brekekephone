import * as UCClient from 'brekekejs/lib/ucclient';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import { createModelView } from 'redux-model';

import authStore from '../../mobx/authStore';
import * as routerUtils from '../../mobx/routerStore';
import UI, { UC_CONNECT_STATES } from './ui';
import toast from '../../nativeModules/toast';

@observer
@createModelView(
  getter => state => ({
    //
  }),
  action => emit => ({
    fillUsers(users) {
      emit(action.ucUsers.refill(users));
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
  }),
)
@observer
class View extends React.Component {
  static contextTypes = {
    uc: PropTypes.object.isRequired,
  };

  state = {
    connectState: UC_CONNECT_STATES.NONE,
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
      this.auth();
    }
  }

  componentWillUnmount() {
    this.context.uc.off('connection-stopped', this.onConnectionStopped);
    this.context.uc.disconnect();
    this._setStateForLifecycle(UC_CONNECT_STATES.NONE, false);
    authStore.set('ucState', 'stopped');
    this.props.reinitBuddyChats();
    this.props.clearAllGroupChats();
    this.props.clearAllChatGroups();
  }

  _setStateForLifecycle = connectState => {
    this._connectState = connectState;

    this.setState({
      connectState: connectState,
    });
  };

  _setConnectStateForLifecycle = connectState => {
    this._setStateForLifecycle(connectState);
  };

  needToAutoAuth = () => {
    if (!authStore.profile || !authStore.profile.ucEnabled) {
      return false;
    }

    if (this._connectState !== UC_CONNECT_STATES.NONE) {
      return false;
    }

    if (authStore.ucLoginFromAnotherPlace) {
      return false;
    }

    return true;
  };

  auth = () => {
    this.context.uc.disconnect();
    authStore.set('ucState', 'started');
    this._setStateForLifecycle(UC_CONNECT_STATES.CONNECTING, false);
    this.context.uc
      .connect(authStore.profile)
      .then(this.onAuthSuccess)
      .catch(this.onAuthFailure);
  };

  onAuthSuccess = () => {
    authStore.set('ucState', 'success');
    this.loadUsers();
    this.loadUnreadChats();
    this._setConnectStateForLifecycle(UC_CONNECT_STATES.CONNECTED);
  };

  onAuthFailure = err => {
    if (err && err.message) {
      toast.error(err.message);
    }

    if (err && err.code === UCClient.Errors.ALREADY_SIGNED_IN) {
      authStore.set('ucLoginFromAnotherPlace', false);
    }

    authStore.set('ucState', 'failure');
    this._setStateForLifecycle(UC_CONNECT_STATES.CONNECT_FAILED);
  };

  onConnectionStopped = e => {
    authStore.set(
      'ucLoginFromAnotherPlace',
      e.code === UCClient.Errors.PLEONASTIC_LOGIN,
    );
    this._setStateForLifecycle(UC_CONNECT_STATES.NONE);
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
    toast.error('Failed to load unread chats');

    if (err && err.message) {
      toast.error(err.message);
    }
  };

  render() {
    const connectState = this._connectState;

    if (
      connectState === UC_CONNECT_STATES.CONNECTED ||
      !authStore.profile?.ucEnabled
    ) {
      return null;
    }

    return (
      <UI
        failure={authStore.ucState === 'failure'}
        abort={routerUtils.goToProfilesManage}
        retry={this.auth}
        connectState={connectState}
        didPleonasticLogin={authStore.ucLoginFromAnotherPlace}
      />
    );
  }
}

export default View;
