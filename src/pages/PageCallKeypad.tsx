import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { Component, createRef } from 'react'
import {
  NativeSyntheticEvent,
  TextInput,
  TextInputSelectionChangeEventData,
} from 'react-native'

import { KeyPad } from '../components/CallKeyPad'
import { ShowNumber } from '../components/CallShowNumbers'
import { Layout } from '../components/Layout'
import { callStore } from '../stores/callStore'
import { intl, intlDebug } from '../stores/intl'
import { RnAlert } from '../stores/RnAlert'
import { RnKeyboard } from '../stores/RnKeyboard'

@observer
export class PageCallKeypad extends Component {
  @observable txt = ''
  txtRef = createRef<TextInput>()
  txtSelection = { start: 0, end: 0 }

  showKeyboard = () => {
    this.txtRef.current?.focus()
  }
  callVoice = () => {
    this.txt = this.txt.trim()
    if (!this.txt) {
      RnAlert.error({
        message: intlDebug`No target to call`,
      })
      return
    }
    callStore.startCall(this.txt)
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
              // Update text to trigger render
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
