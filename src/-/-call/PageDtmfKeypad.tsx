import { observable } from 'mobx'
import { observer } from 'mobx-react'
import React from 'react'

import sip from '../api/sip'
import Nav from '../global/Nav'
import RnAlert from '../global/RnAlert'
import RnKeyboard from '../global/RnKeyboard'
import intl, { intlDebug } from '../intl/intl'
import Layout from '../shared/Layout'
import KeyPad from './KeyPad'
import ShowNumber from './ShowNumbers'

@observer
class PageDtmfKeypad extends React.Component<{
  callId: string
  partyName: string
}> {
  @observable txt = ''
  txtRef = React.createRef<HTMLInputElement>()
  txtSelection = { start: 0, end: 0 }

  showKeyboard = () => {
    this.txtRef.current?.focus()
  }

  sendKey = key => {
    sip.sendDTMF(key, this.props.callId)
  }

  callVoice = () => {
    this.txt = this.txt.trim()
    if (!this.txt) {
      RnAlert.error({
        message: intlDebug`No target`,
      })
      return
    }
    sip.createSession(this.txt, {
      videoEnabled: false,
    })
    Nav.goToPageCallManage()
  }

  render() {
    return (
      <Layout
        description={intl`Keypad dial manually`}
        onBack={Nav.backToPageCallManage}
        title={this.props.partyName}
      >
        <ShowNumber
          refInput={this.txtRef}
          selectionChange={
            RnKeyboard.isKeyboardShowing
              ? null
              : e => {
                  Object.assign(this.txtSelection, {
                    start: e.nativeEvent.selection.start,
                    end: e.nativeEvent.selection.end,
                  })
                }
          }
          setTarget={v => {
            this.txt = v
          }}
          value={this.txt}
        />
        {!RnKeyboard.isKeyboardShowing && (
          <KeyPad
            callVoice={this.callVoice}
            onPressNumber={v => {
              this.sendKey(v)
              const { end, start } = this.txtSelection
              let min = Math.min(start, end)
              let max = Math.max(start, end)
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

export default PageDtmfKeypad
