import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { Component, createRef } from 'react'
import type {
  NativeSyntheticEvent,
  TextInput,
  TextInputSelectionChangeEventData,
} from 'react-native'

import { KeyPad } from '#/components/call-key-pad'
import { ShowNumber } from '#/components/call-show-numbers'
import { Layout } from '#/components/layout'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/rn-alert'
import { RnKeyboard } from '#/stores/rn-keyboard'

@observer
export class PageCallKeypad extends Component {
  @observable txt = ''
  txtRef = createRef<TextInput>()
  txtSelection = { start: 0, end: 0 }

  showKeyboard = () => {
    // android: focus() on an already-focused input is a no-op and the IME
    // stays hidden after a back-press; blur first to force a real re-focus
    this.txtRef.current?.blur()
    setTimeout(() => this.txtRef.current?.focus(), 50)
  }
  callVoice = async () => {
    this.txt = this.txt.trim()
    if (!this.txt) {
      RnAlert.error({
        message: intlDebug`No target to call`,
      })
      return
    }
    if (await ctx.call.startCall(this.txt)) {
      // clear text after call
      this.txt = ''
      this.txtSelection = { start: 0, end: 0 }
    }
  }

  render() {
    return (
      <Layout
        description={intl`Keypad dial manually`}
        fabOnNext={RnKeyboard.isKeyboardShowing ? this.callVoice : undefined}
        fabOnNextText={intl`DIAL`}
        menu='call'
        subMenu='keypad'
        title={intl`Keypad`}
      >
        <ShowNumber
          refInput={this.txtRef}
          selectionChange={(
            e: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
          ) => {
            Object.assign(this.txtSelection, {
              start: e.nativeEvent.selection.end,
              end: e.nativeEvent.selection.end,
            })
          }}
          setTarget={(v: string) => {
            this.txt = v
          }}
          value={this.txt}
        />
        {!RnKeyboard.isKeyboardShowing && (
          <KeyPad
            callVoice={this.callVoice}
            onPressNumber={v => {
              const { end, start } = this.txtSelection
              let min = Math.min(start, end)
              const max = Math.max(start, end)
              const isDelete = v === ''
              if (isDelete) {
                if (start === end && start) {
                  min = min - 1
                }
              }
              // update text to trigger render
              const t = this.txt
              this.txt = t.substring(0, min) + v + t.substring(max)
              //
              const p = min + (isDelete ? 0 : 1)
              this.txtSelection.start = p
              this.txtSelection.end = p
            }}
            showKeyboard={this.showKeyboard}
          />
        )}
      </Layout>
    )
  }
}
