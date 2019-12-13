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
    selection: { start: 0, end: 0 },
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

  insertText = (oldVal, val, start, end) => {
    return val === `delete`
      ? oldVal.substring(0, start === end ? start - 1 : start) +
          oldVal.substring(end, oldVal.length)
      : oldVal.substring(0, start) + val + oldVal.substring(end, oldVal.length);
  };

  onPressNumber = (val, { end, start }) => {
    let curText = this.state.target;
    this.textInput.focus();

    if (isNaN(val)) {
      //-> delete
      if (start > 0) {
        this.setState({
          selection: {
            start: start === end ? start - 1 : start,
            end: start === end ? start - 1 : start,
          },
        });
        curText = this.insertText(curText, val, start, end);
      }
    } else {
      // -> insert
      start === curText.length && end === curText.length
        ? this.setState({
            selection: { start: curText.length + 1, end: curText.length + 1 },
          })
        : this.setState({ selection: { start: start + 1, end: start + 1 } });
      curText = this.insertText(curText, val, start, end);
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
