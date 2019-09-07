import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import PagePhoneCall from '../../components-Phone/PagePhoneCall';
import callStore from '../../shared/callStore';
import contactStore from '../../shared/contactStore';
import routerStore from '../../shared/routerStore';
import Toast from '../../shared/Toast';

@observer
class View extends React.Component {
  static contextTypes = {
    sip: PropTypes.object.isRequired,
  };

  state = {
    text: '',
    target: '',
    video: false,
  };

  render() {
    return (
      <PagePhoneCall
        target={this.state.target}
        matchIds={this.getMatchIds()}
        video={this.state.video}
        resolveMatch={this.resolveMatch}
        setTarget={this.setTarget}
        selectMatch={this.selectMatch}
        setVideo={this.setVideo}
        create={this.create}
        calls={routerStore.goToCallsManage}
        recent={routerStore.goToCallsRecent}
        callVoice={this.callVoice}
        callVideo={this.callVideo}
        parkingIds={callStore.runnings.filter(c => c.parking).map(c => c.id)}
        onPress={this.onPress}
        showNum={this.state.target}
      />
    );
  }

  onPress = val => {
    let curText = this.state.target;
    if (isNaN(val)) {
      if (val === 'delete') {
        curText = curText.slice(0, -1);
      } else {
        curText += val;
      }
    } else {
      curText += val;
    }
    this.setState({ target: curText });
  };

  setTarget = target => {
    this.setState({
      target,
    });
  };

  isMatchUser = id => {
    const searchTextLC = this.state.target.toLowerCase();
    const userId = id && id.toLowerCase();
    let pbxUserName;

    const pbxUser = contactStore.getPBXUser(id) || {
      name: '',
    };

    if (pbxUser) {
      pbxUserName = pbxUser.name.toLowerCase();
    } else {
      pbxUserName = '';
    }

    return userId.includes(searchTextLC) || pbxUserName.includes(searchTextLC);
  };

  getMatchIds = () =>
    contactStore.pbxUsers.map(u => u.id).filter(this.isMatchUser);

  resolveMatch = id => {
    const match = contactStore.getPBXUser(id);

    return {
      name: match.name,
      number: id,
      calling: !!match.talkers?.filter(t => t.status === 'calling').length,
      ringing: !!match.talkers?.filter(t => t.status === 'ringing').length,
      talking: !!match.talkers?.filter(t => t.status === 'talking').length,
      holding: !!match.talkers?.filter(t => t.status === 'holding').length,
    };
  };

  selectMatch = number => {
    this.setTarget(number);
  };

  setVideo = video => {
    this.setState({
      video,
    });
  };

  create = match => {
    const { target, video } = this.state;

    if (!target.trim()) {
      Toast.error('No target');
      return;
    }

    const { sip } = this.context;

    sip.createSession(target, {
      videoEnabled: video,
    });

    routerStore.goToCallsManage();
  };

  call = (target, bVideoEnabled) => {
    if (!target.trim()) {
      Toast.error('No target');
      return;
    }

    const { sip } = this.context;

    sip.createSession(target, {
      videoEnabled: bVideoEnabled,
    });

    routerStore.goToCallsManage();
  };

  callVoice = match => {
    const { target } = this.state;

    this.call(target, false);
  };

  callVideo = match => {
    const { target } = this.state;

    this.call(target, true);
  };
}

export default View;
