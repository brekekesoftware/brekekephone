import { observable } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import sip from '../api/sip';
import g from '../global';
import Layout from '../shared/Layout';
import KeyPad from './KeyPad';
import ShowNumber from './ShowNumbers';

@observer
class PageCallKeypad extends React.Component {
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
          selectionChange={
            g.isKeyboardShowing
              ? null
              : e => {
                  Object.assign(this.txtSelection, {
                    start: e.nativeEvent.selection.start,
                    end: e.nativeEvent.selection.end,
                  });
                }
          }
          setTarget={v => {
            this.txt = v;
          }}
          value={this.txt}
        />
        {!g.isKeyboardShowing && (
          <KeyPad
            callVoice={() => {
              this.txt = this.txt.trim();
              if (!this.txt) {
                g.showError({ message: `No target` });
                return;
              }
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
              //
              const p = min + (isDelete ? 0 : 1);
              this.txtSelection.start = p;
              this.txtSelection.end = p;
            }}
            showKeyboard={() => {
              this.txtRef.current.focus();
            }}
          />
        )}
      </Layout>
    );
  }
}

export default PageCallKeypad;
