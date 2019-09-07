import * as UCClient from 'brekekejs/lib/ucclient';
import { observe } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import authStore from '../../mobx/authStore';
import chatStore from '../../mobx/chatStore';
import contactStore from '../../mobx/contactStore';
import routerStore from '../../mobx/routerStore';
import toast from '../../shared/Toast';
import UI from './ui';

@observer
class View extends React.Component {
  static contextTypes = {
    uc: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.context.uc.on('connection-stopped', this.onConnectionStopped);
    this.autoAuth();
    this.clearObserve = observe(authStore, 'ucShouldAuth', this.autoAuth);
  }

  componentWillUnmount() {
    this.clearObserve();
    this.context.uc.off('connection-stopped', this.onConnectionStopped);
    this.context.uc.disconnect();
    authStore.set('ucState', 'stopped');
  }

  auth = () => {
    this.context.uc.disconnect();
    authStore.set('ucState', 'connecting');
    authStore.set('ucLoginFromAnotherPlace', false);
    this.context.uc
      .connect(authStore.profile)
      .then(this.onAuthSuccess)
      .catch(this.onAuthFailure);
  };
  autoAuth = () => {
    if (authStore.ucShouldAuth) {
      this.auth();
    }
  };

  onAuthSuccess = () => {
    this.loadUsers();
    this.loadUnreadChats().then(() => {
      authStore.set('ucState', 'success');
    });
  };
  onAuthFailure = err => {
    authStore.set('ucState', 'failure');
    toast.error(`Failed to connect to UC, err: ${err?.message}`);
    console.error(err);
  };

  onConnectionStopped = e => {
    authStore.set('ucState', 'failure');
    authStore.set(
      'ucLoginFromAnotherPlace',
      e.code === UCClient.Errors.PLEONASTIC_LOGIN,
    );
  };

  loadUsers = () => {
    const users = this.context.uc.getUsers();
    contactStore.set('ucUsers', users);
  };

  loadUnreadChats = () =>
    this.context.uc
      .getUnreadChats()
      .then(this.onLoadUnreadChatsSuccess)
      .catch(this.onLoadUnreadChatsFailure);

  onLoadUnreadChatsSuccess = chats => {
    chats.forEach(chat => {
      chatStore.pushMessages(chat.creator, [chat]);
    });
  };

  onLoadUnreadChatsFailure = err => {
    toast.error('Failed to load unread chats');
    if (err && err.message) {
      toast.error(err.message);
    }
  };

  render() {
    if (!authStore.profile?.ucEnabled || authStore.ucState === 'success') {
      return null;
    }
    return (
      <UI
        failure={authStore.ucState === 'failure'}
        abort={routerStore.goToSigninPage}
        retry={this.auth}
        didPleonasticLogin={authStore.ucLoginFromAnotherPlace}
      />
    );
  }
}

export default View;
