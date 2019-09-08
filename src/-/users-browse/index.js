import uniq from 'lodash/uniq';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import authStore from '../../shared/authStore';
import contactStore from '../../shared/contactStore';
import routerStore from '../../shared/routerStore';
import PageContact from '../components-Contacts/PageContact';

@observer
class View extends React.Component {
  static contextTypes = {
    sip: PropTypes.object.isRequired,
  };

  state = {
    isModalVisible: false,
    id: '',
    activeFab: false,
  };

  render() {
    return (
      <PageContact
        searchText={contactStore.searchText}
        userIds={this.getMatchUserIds()}
        resolveUser={this.resolveUser}
        callVoice={this.callVoice}
        callVideo={this.callVideo}
        chat={routerStore.goToBuddyChatsRecent}
        setSearchText={contactStore.setF('searchText')}
        toggleModal={this.toggleModal}
        isModalVisible={this.state.isModalVisible}
        exitModal={this.exitModal}
        iduser={this.state.id}
        activeFab={this.state.activeFab}
      />
    );
  }

  toggleModal = id => {
    this.setState({ isModalVisible: !this.state.isModalVisible, id: id });
  };

  exitModal = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible });
  };

  isMatchUser = id => {
    if (!id) {
      return false;
    }
    let userId = id;
    let pbxUserName;
    const pbxUser = contactStore.getPBXUser(id);
    if (pbxUser) {
      pbxUserName = pbxUser.name;
    } else {
      pbxUserName = '';
    }
    let ucUserName;
    const ucUser = contactStore.getUCUser(id);
    if (ucUser) {
      ucUserName = ucUser.name;
    } else {
      ucUserName = '';
    }
    //
    userId = userId.toLowerCase();
    pbxUserName = pbxUserName.toLowerCase();
    ucUserName = ucUserName.toLowerCase();
    const txt = contactStore.searchText.toLowerCase();
    return (
      userId.includes(txt) ||
      pbxUserName.includes(txt) ||
      ucUserName.includes(txt)
    );
  };

  getMatchUserIds() {
    const userIds = uniq([
      ...contactStore.pbxUsers.map(u => u.id),
      ...contactStore.ucUsers.map(u => u.id),
    ]);
    return userIds.filter(this.isMatchUser);
  }

  resolveUser = id => {
    const pbxUser = contactStore.getPBXUser(id) || {};
    const ucUser = contactStore.getUCUser(id) || {};

    return {
      id: id,
      name: pbxUser.name || ucUser.name,
      statusText: ucUser.statusText,
      avatar: ucUser.avatar,
      callTalking: !!pbxUser.talkers?.filter(t => t.status === 'calling')
        .length,
      callHolding: !!pbxUser.talkers?.filter(t => t.status === 'ringing')
        .length,
      callRinging: !!pbxUser.talkers?.filter(t => t.status === 'talking')
        .length,
      callCalling: !!pbxUser.talkers?.filter(t => t.status === 'holding')
        .length,
      chatOffline: ucUser.status === 'offline',
      chatOnline: ucUser.status === 'online',
      chatIdle: ucUser.status === 'idle',
      chatBusy: ucUser.status === 'busy',
      chatEnabled: authStore.profile?.ucEnabled,
    };
  };

  callVoice = userId => {
    const { sip } = this.context;

    sip.createSession(userId);
    routerStore.goToCallsManage();
  };

  callVideo = userId => {
    const { sip } = this.context;

    sip.createSession(userId, {
      videoEnabled: true,
    });

    routerStore.goToCallsManage();
  };
}

export default View;
