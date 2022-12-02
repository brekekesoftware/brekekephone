import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { Component, createRef } from 'react'
import {
  NativeSyntheticEvent,
  TextInput,
  TextInputSelectionChangeEventData,
} from 'react-native'

import { sip } from '../api/sip'
import { KeyPad } from '../components/CallKeyPad'
import { ShowNumber } from '../components/CallShowNumbers'
import { Layout } from '../components/Layout'
import { getAuthStore } from '../stores/authStore'
import { callStore } from '../stores/callStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { RnKeyboard } from '../stores/RnKeyboard'
import { onBackToCallManageScreen } from '../utils/backToCallManage'

@observer
export class PageCallDtmfKeypad extends Component {
  prevId?: string
  componentDidMount() {
    this.componentDidUpdate()
  }
  componentDidUpdate() {
    const c = callStore.getCurrentCall()
    if (this.prevId && this.prevId !== c?.id) {
      onBackToCallManageScreen()
    }
    this.prevId = c?.id
  }

  @observable txt = ''
  txtRef = createRef<TextInput>()
  txtSelection = { start: 0, end: 0 }

  showKeyboard = () => {
    this.txtRef.current?.focus()
  }

  sendKey = (key: string) => {
    const c = callStore.getCurrentCall()
    const cp = getAuthStore().getCurrentAccount()
    if (!c || !cp) {
      return
    }
    sip.sendDTMF({
      signal: key,
      sessionId: c.id,
      tenant: c.pbxTenant || cp.pbxTenant,
      talkerId: c.pbxTalkerId || c.partyNumber,
    })
  }

  render() {
    const c = callStore.getCurrentCall()
    return (
      <Layout
        title={c?.getDisplayName()}
        description={intl`Keypad dial manually`}
        onBack={onBackToCallManageScreen}
      >
        <ShowNumber
          refInput={this.txtRef}
          selectionChange={
            RnKeyboard.isKeyboardShowing
              ? undefined
              : (
                  e: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
                ) => {
                  Object.assign(this.txtSelection, {
                    start: e.nativeEvent.selection.start,
                    end: e.nativeEvent.selection.end,
                  })
                }
          }
          setTarget={(v: string) => {
            this.txt = v
          }}
          value={this.txt}
        />
        {!RnKeyboard.isKeyboardShowing && (
          <KeyPad
            onPressNumber={v => {
              this.sendKey(v)
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
