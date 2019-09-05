import uniq from 'lodash/uniq';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import { createModelView } from 'redux-model';

import PageContact from '../../components-Contacts/PageContact';
import authStore from '../../mobx/authStore';
import contactStore from '../../mobx/contactStore';
import routerStore from '../../mobx/routerStore';

@observer
@createModelView(
  getter => state => ({
    ucEnabled: authStore.profile?.ucEnabled,
    searchText: getter.usersBrowsing.searchText(state),
    ucUserIds: getter.ucUsers.idsByOrder(state),
    ucUserById: getter.ucUsers.detailMapById(state),
  }),
  action => emit => ({
    setSearchText(value) {
      emit(action.usersBrowsing.setSearchText(value));
    },
  }),
)
@observer
class View extends React.Component {
  static contextTypes = {
    sip: PropTypes.object.isRequired,
  };

  static defaultProps = {
    searchText: '',
    ucUserIds: [],
    ucUserById: {},
  };

  state = {
    isModalVisible: false,
    id: '',
    activeFab: false,
  };

  render() {
    return (
      <PageContact
        searchText={this.props.searchText}
        userIds={this.getMatchUserIds()}
        resolveUser={this.resolveUser}
        callVoice={this.callVoice}
        callVideo={this.callVideo}
        chat={routerStore.goToBuddyChatsRecent}
        setSearchText={this.setSearchText}
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

    const { ucUserById, searchText } = this.props;

    const searchTextLC = searchText.toLowerCase();
    const userId = id && id.toLowerCase();
    let pbxUserName;
    const pbxUser = contactStore.getPBXUser(id);

    if (pbxUser) {
      pbxUserName = pbxUser.name;
    } else {
      pbxUserName = '';
    }

    let ucUserName;
    const ucUser = ucUserById[id];

    if (ucUser) {
      ucUserName = ucUser.name;
    } else {
      ucUserName = '';
    }

    return (
      userId.includes(searchTextLC) ||
      pbxUserName.includes(searchTextLC) ||
      ucUserName.includes(searchTextLC)
    );
  };

  getMatchUserIds() {
    const { ucUserIds } = this.props;
    const userIds = uniq([
      ...contactStore.pbxUsers.map(u => u.id),
      ...ucUserIds,
    ]);
    return userIds.filter(this.isMatchUser);
  }

  resolveUser = id => {
    const { ucUserById } = this.props;

    const pbxUser = contactStore.getPBXUser(id) || {};

    const ucUser = ucUserById[id] || {};

    return {
      id: id,
      name: pbxUser.name || ucUser.name,
      mood: ucUser.mood,
      avatar: ucUser.avatar,
      callTalking: !!pbxUser.talkers?.filter(t => t.status === 'calling')
        .length,
      callHolding: !!pbxUser.talkers?.filter(t => t.status === 'ringing')
        .length,
      callRinging: !!pbxUser.talkers?.filter(t => t.status === 'talking')
        .length,
      callCalling: !!pbxUser.talkers?.filter(t => t.status === 'holding')
        .length,
      chatOffline: ucUser.offline,
      chatOnline: ucUser.online,
      chatIdle: ucUser.idle,
      chatBusy: ucUser.busy,
      chatEnabled: this.props.ucEnabled,
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

  setSearchText = value => {
    this.props.setSearchText(value);
  };
}

export default View;
