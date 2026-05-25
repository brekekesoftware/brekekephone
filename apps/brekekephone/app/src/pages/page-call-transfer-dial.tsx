import { makeObservable, observable } from 'mobx'
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
import { setPageCallTransferDial } from '#/components/navigation-config'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/rn-alert'
import { RnKeyboard } from '#/stores/rn-keyboard'

export const PageCallTransferDial = observer(
  class PageCallTransferDial extends Component {
    prevId?: string
    componentDidMount = () => {
      this.componentDidUpdate()
    }
    componentDidUpdate = () => {
      if (this.prevId && this.prevId !== ctx.call.ongoingCallId) {
        ctx.nav.backToPageCallManage()
      }
      this.prevId = ctx.call.ongoingCallId
    }

    state = { txt: '' }
    txtRef = createRef<TextInput>()
    txtSelection = { start: 0, end: 0 }

    showKeyboard = () => {
      this.txtRef.current?.focus()
    }

    transferBlind = () => {
      const trimmed = this.state.txt.trim()
      this.setState({ txt: trimmed })
      if (!trimmed) {
        RnAlert.error({
          message: intlDebug`No target`,
        })
        return
      }
      ctx.call.getOngoingCall()?.transferBlind(trimmed)
    }
    transferAttended = () => {
      const trimmed = this.state.txt.trim()
      this.setState({ txt: trimmed })
      if (!trimmed) {
        RnAlert.error({
          message: intlDebug`No target`,
        })
        return
      }
      ctx.call.getOngoingCall()?.transferAttended(trimmed)
    }

    render() {
      const { txt } = this.state
      return (
        <Layout
          description={intl`Select target to start transfer`}
          onBack={ctx.nav.backToPageCallManage}
          menu='call_transfer'
          subMenu='external_number'
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
              this.setState({ txt: v })
            }}
            value={txt}
          />
          {!RnKeyboard.isKeyboardShowing && (
            <KeyPad
              callVoice={this.transferBlind}
              callVoiceForward={this.transferAttended}
              onPressNumber={v => {
                // TODO: create new component with PageCallDtmfKeypad
                // to avoid duplicated code
                const { end, start } = this.txtSelection
                let min = Math.min(start, end)
                const max = Math.max(start, end)
                const isDelete = v === ''
                if (isDelete) {
                  if (start === end && start) {
                    min = min - 1
                  }
                }
                this.setState({
                  txt: txt.substring(0, min) + v + txt.substring(max),
                })
                const position = min + (isDelete ? 0 : 1)
                this.txtSelection.start = position
                this.txtSelection.end = position
              }}
              showKeyboard={this.showKeyboard}
            />
          )}
        </Layout>
      )
    }
  },
)

setPageCallTransferDial(PageCallTransferDial)
