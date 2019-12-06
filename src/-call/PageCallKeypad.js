import PropTypes from 'prop-types';
import React from 'react';

import g from '../global';
import Layout from '../shared/Layout';
import KeyPad from './KeyPad';
import ShowNumber from './ShowNumbers';

class PageCallKeypad extends React.Component {
  static contextTypes = {
    sip: PropTypes.object.isRequired,
  };

  state = {
    target: ``,
    video: false,
  };

  onPressNumber = val => {
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
    this.setState({ target });
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

    g.goToPageCallManage();
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

    g.goToPageCallManage();
  };

  callVoice = () => {
    const { target } = this.state;

    this.call(target, false);
  };

  render() {
    return (
      <Layout
        footer={{
          navigation: {
            menu: `phone`,
          },
          KeyPad: true,
        }}
        header={{
          description: `Keypad dial manually`,
          title: `Keypad`,
          navigation: {
            menu: `phone`,
            subMenu: `keypad`,
          },
        }}
      >
        <ShowNumber setTarget={this.setTarget} value={this.state.target} />
        <KeyPad callVoice={this.callVoice} onPressNumber={this.onPressNumber} />
      </Layout>
    );
  }
}

export default PageCallKeypad;
