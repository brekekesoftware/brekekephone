import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import PageSetting from '../../components-Setting/PageSetting';
import authStore from '../../mobx/authStore';
import * as routerUtils from '../../mobx/routerStore';
import toast from '../../nativeModules/toast';

@observer
class View extends React.Component {
  static contextTypes = {
    uc: PropTypes.object.isRequired,
  };

  state = {
    chatMood: false,
    chatOffline: false,
    chatOnline: false,
    chatBusy: false,
  };

  componentDidMount() {
    const me = this.context.uc.me();

    this.setState({
      chatMood: me.mood,
      chatOffline: me.offline,
      chatOnline: me.online,
      chatBusy: me.busy,
    });
  }

  render = () => (
    <PageSetting
      profile={authStore.profile}
      chatOffline={this.state.chatOffline}
      chatOnline={this.state.chatOnline}
      chatBusy={this.state.chatBusy}
      chatMood={this.state.chatMood}
      setChatOnline={this.setChatOnline}
      setChatOffline={this.setChatOffline}
      setChatBusy={this.setChatBusy}
      setChatMood={this.setChatMood}
      submitChatMood={this.submitChatMood}
      signout={routerUtils.goToProfilesManage}
    />
  );

  onSetChatStatusSuccess = () => {
    const me = this.context.uc.me();

    this.setState({
      chatMood: me.mood,
      chatOffline: me.offline,
      chatOnline: me.online,
      chatBusy: me.busy,
    });
  };

  onSetChatStatusFailure = () => {
    toast.error('Failed to change chat status');
  };

  setChatOffline = () => {
    const { uc } = this.context;
    uc.setOffline(this.state.chatMood)
      .then(this.onSetChatStatusSuccess)
      .catch(this.onSetChatStatusFailure);
  };

  setChatOnline = () => {
    const { uc } = this.context;

    uc.setOnline(this.state.chatMood)
      .then(this.onSetChatStatusSuccess)
      .catch(this.onSetChatStatusFailure);
  };

  setChatBusy = () => {
    const { uc } = this.context;

    uc.setBusy(this.state.chatMood)
      .then(this.onSetChatStatusSuccess)
      .catch(this.onSetChatStatusFailure);
  };

  setChatMood = chatMood => {
    this.setState({
      chatMood,
    });
  };

  submitChatMood = () => {
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
