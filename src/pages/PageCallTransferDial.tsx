import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { Component, createRef } from 'react'
import {
  NativeSyntheticEvent,
  Platform,
  TextInput,
  TextInputSelectionChangeEventData,
} from 'react-native'

import { KeyPad } from '../components/CallKeyPad'
import { ShowNumber } from '../components/CallShowNumbers'
import { Layout } from '../components/Layout'
import { setPageCallTransferDial } from '../components/navigationConfig2'
import { callStore } from '../stores/callStore'
import { intl, intlDebug } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { RnAlert } from '../stores/RnAlert'
import { RnKeyboard } from '../stores/RnKeyboard'
import { onBackToCallManageScreen } from '../utils/backToCallManage'
import { BrekekeUtils } from '../utils/RnNativeModules'

@observer
export class PageCallTransferDial extends Component {
  prevId?: string
  componentDidMount() {
    this.componentDidUpdate()
  }
  componentDidUpdate() {
    if (this.prevId && this.prevId !== callStore.currentCallId) {
      Nav().backToPageCallManage()
    }
    this.prevId = callStore.currentCallId
  }

  @observable txt = ''
  txtRef = createRef<TextInput>()
  txtSelection = { start: 0, end: 0 }

  showKeyboard = () => {
    this.txtRef.current?.focus()
  }

  transferBlind = () => {
    this.txt = this.txt.trim()
    if (!this.txt) {
      RnAlert.error({
        message: intlDebug`No target`,
      })
      return
    }
    callStore.getCurrentCall()?.transferBlind(this.txt)
  }
  transferAttended = () => {
    this.txt = this.txt.trim()
    if (!this.txt) {
      RnAlert.error({
        message: intlDebug`No target`,
      })
      return
    }
    callStore.getCurrentCall()?.transferAttended(this.txt)
  }

  render() {
    return (
      <Layout
        description={intl`Select target to start transfer`}
        onBack={onBackToCallManageScreen}
        menu={'call_transfer'}
        subMenu={'external_number'}
        isTab
        title={intl`Transfer`}
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
            callVoice={this.transferBlind}
            callVoiceForward={this.transferAttended}
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

setPageCallTransferDial(PageCallTransferDial)
