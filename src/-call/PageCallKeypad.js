import { observable } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import g from '../global';
import { Keyboard } from '../native/Rn';
import Layout from '../shared/Layout';
import KeyPad from './KeyPad';
import ShowNumber from './ShowNumbers';

@observer
class PageCallKeypad extends React.Component {
  static contextTypes = {
    sip: PropTypes.object.isRequired,
  };

  @observable txt = ``;
  txtRef = React.createRef();
  txtSelection = { start: 0, end: 0 };

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
          refInput={this.txtRef}
          selectionChange={e => {
            Object.assign(this.txtSelection, {
              start: e.nativeEvent.selection.start,
              end: e.nativeEvent.selection.end,
            });
          }}
          setTarget={v => {
            this.txt = v;
          }}
          showKeyboradNumpad={() => {
            Keyboard.dismiss();
          }}
          value={this.txt}
        />
        <KeyPad
          callVoice={() => {
            this.txt = this.txt.trim();
            if (!this.txt) {
              g.showError({ message: `No target` });
              return;
            }
            const { sip } = this.context;
            sip.createSession(this.txt, {
              videoEnabled: false,
            });
            g.goToPageCallManage();
          }}
          onPressNumber={v => {
            const { end, start } = this.txtSelection;
            let min = Math.min(start, end);
            let max = Math.max(start, end);
            const isDelete = v === ``;
            if (isDelete) {
              if (start === end && start) {
                min = min - 1;
              }
            }
            // Update text to trigger render
            const t = this.txt;
            this.txt = t.substring(0, min) + v + t.substring(max);
            // Add timeout to make sure it updates the selection after rendering
            setTimeout(() => {
              const p = min + (isDelete ? 0 : 1);
              this.txtRef.current.setNativeProps({
                selection: {
                  start: p,
                  end: p,
                },
              });
              this.txtRef.current.focus();
            }, 17);
          }}
          showKeyboard={() => {
            this.txtRef.current.focus();
          }}
        />
      </Layout>
    );
  }
}

export default PageCallKeypad;
