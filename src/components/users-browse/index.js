import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import { createModelView } from 'redux-model';

import PageContact from '../../components-Contacts/PageContact';
import authStore from '../../mobx/authStore';
import * as routerUtils from '../../mobx/routerStore';

@observer
@createModelView(
  getter => state => ({
    ucEnabled: authStore.profile?.ucEnabled,
    searchText: getter.usersBrowsing.searchText(state),
    pbxUserIds: getter.pbxUsers.idsByOrder(state),
    pbxUserById: getter.pbxUsers.detailMapById(state),
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
    pbxUserIds: [],
    pbxUserById: {},
    ucUserIds: [],
    ucUserById: {},
  };

  state = {
    isModalVisible: false,
    id: '',
  };

  render = () => (
    <PageContact
      searchText={this.props.searchText}
      userIds={this.getMatchUserIds()}
      resolveUser={this.resolveUser}
      callVoice={this.callVoice}
      callVideo={this.callVideo}
      chat={routerUtils.goToBuddyChatsRecent}
      setSearchText={this.setSearchText}
      toggleModal={this.toggleModal}
      isModalVisible={this.state.isModalVisible}
      exitModal={this.exitModal}
      iduser={this.state.id}
    />
  );

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

    const { pbxUserById, ucUserById, searchText } = this.props;

    const searchTextLC = searchText.toLowerCase();
    const userId = id && id.toLowerCase();
    let pbxUserName;
    const pbxUser = pbxUserById[id];

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
    const { pbxUserIds, ucUserIds } = this.props;

    const userSet = new Set([...pbxUserIds, ...ucUserIds]);
    return Array.from(userSet).filter(this.isMatchUser);
  }

  resolveUser = id => {
    const { pbxUserById, ucUserById } = this.props;

    const pbxUser = pbxUserById[id] || {
      talkingTalkers: [],
      holdingTalkers: [],
      ringingTalkers: [],
      callingTalkers: [],
    };

    const ucUser = ucUserById[id] || {};

    return {
      id: id,
      name: pbxUser.name || ucUser.name,
      mood: ucUser.mood,
      avatar: ucUser.avatar,
      callTalking: !!pbxUser.talkingTalkers.length,
      callHolding: !!pbxUser.holdingTalkers.length,
      callRinging: !!pbxUser.ringingTalkers.length,
      callCalling: !!pbxUser.callingTalkers.length,
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
    routerUtils.goToCallsManage();
  };

  callVideo = userId => {
    const { sip } = this.context;

    sip.createSession(userId, {
      videoEnabled: true,
    });

    routerUtils.goToCallsManage();
  };

  setSearchText = value => {
    this.props.setSearchText(value);
  };
}

export default View;
