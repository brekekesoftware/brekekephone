import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import PageSetting from '../../components-Setting/PageSetting';
import authStore from '../../mobx/authStore';
import routerStore from '../../mobx/routerStore';
import toast from '../../shared/Toast';

@observer
class View extends React.Component {
  static contextTypes = {
    uc: PropTypes.object.isRequired,
  };

  state = {
    statusText: false,
    chatOffline: false,
    chatOnline: false,
    chatBusy: false,
  };

  componentDidMount() {
    const me = this.context.uc.me();

    this.setState({
      statusText: me.statusText,
      chatOffline: me.status === 'offline',
      chatOnline: me.status === 'online',
      chatBusy: me.status === 'busy',
    });
  }

  render() {
    return (
      <PageSetting
        profile={authStore.profile}
        chatOffline={this.state.chatOffline}
        chatOnline={this.state.chatOnline}
        chatBusy={this.state.chatBusy}
        statusText={this.state.statusText}
        setChatOnline={this.setChatOnline}
        setChatOffline={this.setChatOffline}
        setChatBusy={this.setChatBusy}
        setStatusText={this.setStatusText}
        submitStatusText={this.submitStatusText}
        signout={routerStore.goToPageSignIn}
      />
    );
  }

  onSetChatStatusSuccess = () => {
    const me = this.context.uc.me();

    this.setState({
      statusText: me.statusText,
      chatOffline: me.status === 'offline',
      chatOnline: me.status === 'online',
      chatBusy: me.status === 'busy',
    });
  };

  onSetChatStatusFailure = () => {
    toast.error('Failed to change chat status');
  };

  setChatOffline = () => {
    const { uc } = this.context;
    uc.setOffline(this.state.statusText)
      .then(this.onSetChatStatusSuccess)
      .catch(this.onSetChatStatusFailure);
  };

  setChatOnline = () => {
    const { uc } = this.context;

    uc.setOnline(this.state.statusText)
      .then(this.onSetChatStatusSuccess)
      .catch(this.onSetChatStatusFailure);
  };

  setChatBusy = () => {
    const { uc } = this.context;

    uc.setBusy(this.state.statusText)
      .then(this.onSetChatStatusSuccess)
      .catch(this.onSetChatStatusFailure);
  };

  setStatusText = statusText => {
    this.setState({
      statusText,
    });
  };

  submitStatusText = () => {
    const { chatOffline, chatOnline, chatBusy } = this.state;

    if (chatOffline) {
      this.setChatOffline();
    } else if (chatOnline) {
      this.setChatOnline();
    } else if (chatBusy) {
      this.setChatBusy();
    }
  };
}

export default View;
