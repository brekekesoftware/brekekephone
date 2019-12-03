import PropTypes from 'prop-types';
import React from 'react';

import g from '../global';
import Layout from '../shared/Layout';
import ShowNumber from './ShowNumbers';

class PageCallKeypad extends React.Component {
  static contextTypes = {
    sip: PropTypes.object.isRequired,
  };

  state = {
    target: ``,
    video: false,
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
        }}
        header={{
          title: `CallPad`,
          navigation: {
            menu: `phone`,
            subMenu: `keypad`,
          },
        }}
      >
        <ShowNumber
          callVoice={this.callVoice}
          setTarget={this.setTarget}
          value={this.state.target}
        />
      </Layout>
    );
  }
}

export default PageCallKeypad;
