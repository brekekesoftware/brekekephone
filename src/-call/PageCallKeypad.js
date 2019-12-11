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
    keyboard: false,
    selection: {},
  };

  textInput = React.createRef();

  selectionChange = event => {
    this.setState({ selection: event.nativeEvent.selection });
  };

  showKeyboardDefault = () => {
    this.setState({
      keyboard: true,
    });
    this.textInput.focus();
  };

  showKeyboardNumpad = () => {
    this.setState({
      keyboard: false,
    });
  };

  //TODO: coding delete and fix select.
  insertText = (oldVal, val, start, end) => {
    if (!isNaN(start) && !isNaN(end))
      return (
        oldVal.substring(0, start) + val + oldVal.substring(end, oldVal.length)
      );
    return oldVal + val;
  };

  onPressNumber = (val, { end, start }) => {
    let curText = this.state.target;
    if (isNaN(val)) {
      if (val === `delete`) {
        curText = this.insertText(curText, `delete`, start, end);
      } else {
        curText = this.insertText(curText, val, start, end);
      }
    } else {
      curText = this.insertText(curText, val, start, end);
      if ((start === end) === curText.length) {
        this.setState({ selection: { start: start + 1, end: end + 1 } });
      }
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
            menu: `call`,
          },
          KeyPad: true,
        }}
        header={{
          description: `Keypad dial manually`,
          title: `Keypad`,
          navigation: {
            menu: `call`,
            subMenu: `keypad`,
          },
        }}
      >
        <ShowNumber
          isShowKeyboard={this.state.keyboard}
          refInput={el => (this.textInput = el)}
          selection={this.state.selection}
          selectionChange={this.selectionChange}
          setTarget={this.setTarget}
          showKeyboradNumpad={this.showKeyboardNumpad}
          value={this.state.target}
        />
        <KeyPad
          callVoice={this.callVoice}
          onPressNumber={this.onPressNumber}
          selection={this.state.selection}
          showKeyboard={this.showKeyboardDefault}
        />
      </Layout>
    );
  }
}

export default PageCallKeypad;
