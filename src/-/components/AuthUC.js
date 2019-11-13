import * as UCClient from 'brekekejs/lib/ucclient';
import { observe } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import g from '../../global';
import authStore from '../authStore';
import chatStore from '../chatStore';
import contactStore from '../contactStore';
import AuthUCUI from './AuthUCUI';

@observer
class AuthUC extends React.Component {
  static contextTypes = {
    uc: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.context.uc.on(`connection-stopped`, this.onConnectionStopped);
    this.autoAuth();
    this.clearObserve = observe(authStore, `ucShouldAuth`, this.autoAuth);
  }

  componentWillUnmount() {
    this.clearObserve();
    this.context.uc.off(`connection-stopped`, this.onConnectionStopped);
    this.context.uc.disconnect();
    authStore.set(`ucState`, `stopped`);
  }

  auth = () => {
    this.context.uc.disconnect();
    authStore.set(`ucState`, `connecting`);
    authStore.set(`ucLoginFromAnotherPlace`, false);
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
      authStore.set(`ucState`, `success`);
    });
  };
  onAuthFailure = err => {
    authStore.set(`ucState`, `failure`);
    g.showError({ message: `connect to UC` });
    console.error(err);
  };

  onConnectionStopped = e => {
    authStore.set(`ucState`, `failure`);
    authStore.set(
      `ucLoginFromAnotherPlace`,
      e.code === UCClient.Errors.PLEONASTIC_LOGIN,
    );
  };

  loadUsers = () => {
    const users = this.context.uc.getUsers();
    contactStore.set(`ucUsers`, users);
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
    g.showError({ message: `load unread chats` });
    if (err && err.message) {
      g.showError(err.message);
    }
  };

  render() {
    if (!authStore.profile?.ucEnabled || authStore.ucState === `success`) {
      return null;
    }
    return (
      <AuthUCUI
        failure={authStore.ucState === `failure`}
        abort={g.goToPageProfileSignIn}
        retry={this.auth}
        didPleonasticLogin={authStore.ucLoginFromAnotherPlace}
      />
    );
  }
}

export default AuthUC;
