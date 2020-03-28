import * as UCClient from 'brekekejs/lib/ucclient';
import debounce from 'lodash/debounce';
import { observe } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import uc from '../api/uc';
import g from '../global';
import authStore from '../global/authStore';
import chatStore from '../global/chatStore';
import contactStore from '../global/contactStore';
import { intlDebug } from '../intl/intl';

@observer
class AuthUC extends React.Component {
  constructor() {
    // TODO notification login not work
    super();
    uc.on('connection-stopped', this.onConnectionStopped);
    this.autoAuth();
    this.clearObserve = observe(authStore, 'ucShouldAuth', this.autoAuth);
  }
  componentWillUnmount() {
    this.clearObserve();
    uc.off('connection-stopped', this.onConnectionStopped);
    uc.disconnect();
    authStore.set('ucState', 'stopped');
  }

  auth = () => {
    uc.disconnect();
    authStore.set('ucState', 'connecting');
    authStore.set('ucLoginFromAnotherPlace', false);
    uc.connect(authStore.currentProfile)
      .then(this.onAuthSuccess)
      .catch(this.onAuthFailure);
  };
  autoAuth = debounce(() => authStore.ucShouldAuth && this.auth(), 100, {
    maxWait: 300,
  });

  onAuthSuccess = () => {
    this.loadUsers();
    this.loadUnreadChats().then(() => {
      authStore.set('ucState', 'success');
    });
  };
  onAuthFailure = err => {
    authStore.set('ucState', 'failure');
    g.showError({
      message: intlDebug`Failed to connect to UC`,
      err,
    });
  };
  onConnectionStopped = e => {
    authStore.set('ucState', 'failure');
    authStore.set(
      'ucLoginFromAnotherPlace',
      e.code === UCClient.Errors.PLEONASTIC_LOGIN,
    );
  };
  loadUsers = () => {
    const users = uc.getUsers();
    contactStore.set('ucUsers', users);
  };
  loadUnreadChats = () =>
    uc
      .getUnreadChats()
      .then(this.onLoadUnreadChatsSuccess)
      .catch(this.onLoadUnreadChatsFailure);
  onLoadUnreadChatsSuccess = chats => {
    chats.forEach(chat => {
      chatStore.pushMessages(chat.creator, [chat]);
    });
  };
  onLoadUnreadChatsFailure = err => {
    g.showError({
      message: intlDebug`Failed to load unread chat messages`,
      err,
    });
  };

  render() {
    return null;
  }
}

export default AuthUC;
