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
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { RnKeyboard } from '#/stores/rn-keyboard'

export const PageCallDtmfKeypad = observer(() => {
  const ocId = ctx.call.getOngoingCall()?.id
  const prevIdRef = useRef<string>(ocId)
  const [txt, setTxt] = useState('')
  const txtRef = useRef<TextInput>(null)
  const txtSelectionRef = useRef({
    start: 0,
    end: 0,
  })

  useEffect(() => {
    if (prevIdRef.current && prevIdRef.current !== ocId) {
      ctx.nav.backToPageCallManage()
    }
    prevIdRef.current = ocId
  }, [ocId])

  const showKeyboard = () => {
    txtRef.current?.focus()
  }

  const sendKey = (key: string) => {
    const oc = ctx.call.getOngoingCall()
    const ca = ctx.auth.getCurrentAccount()
    if (!oc || !ca) {
      return
    }
    ctx.sip.sendDTMF({
      signal: key,
      sessionId: oc.id,
      tenant: oc.pbxTenant || ca.pbxTenant,
      talkerId: oc.pbxTalkerId || oc.partyNumber,
    })
  }

  const oc = ctx.call.getOngoingCall()
  return (
    <Layout
      title={oc?.getDisplayName()}
      description={intl`Keypad dial manually`}
      onBack={ctx.nav.backToPageCallManage}
    >
      <ShowNumber
        refInput={txtRef}
        selectionChange={
          RnKeyboard.isKeyboardShowing
            ? undefined
            : (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
                Object.assign(txtSelectionRef.current, {
                  start: e.nativeEvent.selection.start,
                  end: e.nativeEvent.selection.end,
                })
              }
        }
        setTarget={(v: string) => setTxt(v)}
        value={txt}
      />
      {!RnKeyboard.isKeyboardShowing && (
        <KeyPad
          onPressNumber={v => {
            sendKey(v)
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
