import { observer } from 'mobx-react'
import { useEffect, useRef, useState } from 'react'
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

export const PageCallTransferDial = observer(() => {
  const prevIdRef = useRef<string | undefined>(undefined)
  const [txt, setTxt] = useState('')
  const txtRef = useRef<TextInput>(null)
  const txtSelectionRef = useRef({
    start: 0,
    end: 0,
  })

  const ongoingCallId = ctx.call.ongoingCallId
  useEffect(() => {
    if (prevIdRef.current && prevIdRef.current !== ongoingCallId) {
      ctx.nav.backToPageCallManage()
    }
    prevIdRef.current = ongoingCallId
  }, [ongoingCallId])

  const showKeyboard = () => {
    txtRef.current?.focus()
  }

  const transferBlind = () => {
    const trimmed = txt.trim()
    setTxt(trimmed)
    if (!trimmed) {
      RnAlert.error({
        message: intlDebug`No target`,
      })
      return
    }
    ctx.call.getOngoingCall()?.transferBlind(trimmed)
  }
  const transferAttended = () => {
    const trimmed = txt.trim()
    setTxt(trimmed)
    if (!trimmed) {
      RnAlert.error({
        message: intlDebug`No target`,
      })
      return
    }
    ctx.call.getOngoingCall()?.transferAttended(trimmed)
  }

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
        refInput={txtRef}
        selectionChange={(
          e: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
        ) => {
          Object.assign(txtSelectionRef.current, {
            start: e.nativeEvent.selection.end,
            end: e.nativeEvent.selection.end,
          })
        }}
        setTarget={(v: string) => {
          setTxt(v)
        }}
        value={txt}
      />
      {!RnKeyboard.isKeyboardShowing && (
        <KeyPad
          callVoice={transferBlind}
          callVoiceForward={transferAttended}
          onPressNumber={v => {
            // TODO: create new component with PageCallDtmfKeypad
            // to avoid duplicated code
            const { end, start } = txtSelectionRef.current
            let min = Math.min(start, end)
            const max = Math.max(start, end)
            const isDelete = v === ''
            if (isDelete) {
              if (start === end && start) {
                min = min - 1
              }
            }
            setTxt(txt.substring(0, min) + v + txt.substring(max))
            const position = min + (isDelete ? 0 : 1)
            txtSelectionRef.current.start = position
            txtSelectionRef.current.end = position
          }}
          showKeyboard={showKeyboard}
        />
      )}
    </Layout>
  )
})

setPageCallTransferDial(PageCallTransferDial)
