import PropTypes from 'prop-types';
import React from 'react';

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

  create = () => {
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

  callVoice = () => {
    const { target } = this.state;

    this.call(target, false);
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
