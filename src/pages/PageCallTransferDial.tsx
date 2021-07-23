import { observable } from 'mobx'
import { observer } from 'mobx-react'
import React from 'react'
import {
  NativeSyntheticEvent,
  TextInput,
  TextInputSelectionChangeEventData,
} from 'react-native'

import KeyPad from '../components/CallKeyPad'
import ShowNumber from '../components/CallShowNumbers'
import Layout from '../components/Layout'
import callStore from '../stores/callStore'
import intl, { intlDebug } from '../stores/intl'
import Nav from '../stores/Nav'
import RnAlert from '../stores/RnAlert'
import RnKeyboard from '../stores/RnKeyboard'

@observer
class PageCallTransferDial extends React.Component {
  prevId?: string
  componentDidMount() {
    this.componentDidUpdate()
  }
  componentDidUpdate() {
    if (this.prevId && this.prevId !== callStore.currentCall()?.id) {
      Nav().backToPageCallManage()
    }
    this.prevId = callStore.currentCall()?.id
  }

  @observable txt = ''
  txtRef = React.createRef<TextInput>()
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
    callStore.currentCall()?.transferBlind(this.txt)
  }
  transferAttended = () => {
    this.txt = this.txt.trim()
    if (!this.txt) {
      RnAlert.error({
        message: intlDebug`No target`,
      })
      return
    }
    callStore.currentCall()?.transferAttended(this.txt)
  }

  render() {
    return (
      <Layout
        description={intl`Select target to start transfer`}
        onBack={Nav().backToPageCallManage}
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

export default PageCallTransferDial
