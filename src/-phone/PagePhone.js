import PropTypes from 'prop-types';
import React from 'react';

import contactStore from '../-/contactStore';
import g from '../global';
import Layout from '../shared/Layout';
import KeyPad from './KeyPad';
import ShowNumber from './ShowNumbers';

class PagePhone extends React.Component {
  static contextTypes = {
    sip: PropTypes.object.isRequired,
  };

  state = {
    text: ``,
    target: ``,
    video: false,
  };

  onPress = val => {
    let curText = this.state.target;
    if (isNaN(val)) {
      if (val === `delete`) {
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
      name: ``,
    };

    if (pbxUser) {
      pbxUserName = pbxUser.name.toLowerCase();
    } else {
      pbxUserName = ``;
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
      calling: !!match.talkers?.filter(t => t.status === `calling`).length,
      ringing: !!match.talkers?.filter(t => t.status === `ringing`).length,
      talking: !!match.talkers?.filter(t => t.status === `talking`).length,
      holding: !!match.talkers?.filter(t => t.status === `holding`).length,
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
      g.showError({ message: `No target` });
      return;
    }

    const { sip } = this.context;

    sip.createSession(target, {
      videoEnabled: video,
    });

    g.goToCallsManage();
  };

  call = (target, bVideoEnabled) => {
    if (!target.trim()) {
      g.showError({ message: `No target` });
      return;
    }

    const { sip } = this.context;

    sip.createSession(target, {
      videoEnabled: bVideoEnabled,
    });

    g.goToCallsManage();
  };

  callVoice = match => {
    const { target } = this.state;

    this.call(target, false);
  };

  callVideo = match => {
    const { target } = this.state;

    this.call(target, true);
  };

  render() {
    return (
      <Layout>
        <ShowNumber showNum={this.state.target} />
        <KeyPad callVoice={this.callVoice} onPress={this.onPress} />
      </Layout>
    );
  }
}

export default PagePhone;
