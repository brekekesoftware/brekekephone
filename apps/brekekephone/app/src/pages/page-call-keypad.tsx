import { observer } from 'mobx-react'
import { useRef, useState } from 'react'
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

export const PageCallKeypad = observer(() => {
  const [txt, setTxt] = useState('')
  const txtRef = useRef<TextInput>(null)
  const txtSelection = useRef({ start: 0, end: 0 })

  const showKeyboard = () => {
    // android: focus() on an already-focused input is a no-op and the IME
    // stays hidden after a back-press; blur first to force a real re-focus
    txtRef.current?.blur()
    setTimeout(() => txtRef.current?.focus(), 50)
  }

  const callVoice = async () => {
    const trimmed = txt.trim()
    setTxt(trimmed)
    if (!trimmed) {
      RnAlert.error({
        message: intlDebug`No target to call`,
      })
      return
    }
    if (await ctx.call.startCall(trimmed)) {
      setTxt('')
      txtSelection.current = { start: 0, end: 0 }
    }
  }

  return (
    <Layout
      description={intl`Keypad dial manually`}
      fabOnNext={RnKeyboard.isKeyboardShowing ? callVoice : undefined}
      fabOnNextText={intl`DIAL`}
      menu='call'
      subMenu='keypad'
      title={intl`Keypad`}
    >
      <ShowNumber
        refInput={txtRef}
        selectionChange={(
          e: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
        ) => {
          txtSelection.current.start = e.nativeEvent.selection.end
          txtSelection.current.end = e.nativeEvent.selection.end
        }}
        setTarget={setTxt}
        value={txt}
      />
      {!RnKeyboard.isKeyboardShowing && (
        <KeyPad
          callVoice={callVoice}
          onPressNumber={v => {
            const { end, start } = txtSelection.current
            let min = Math.min(start, end)
            const max = Math.max(start, end)
            const isDelete = v === ''
            if (isDelete) {
              if (start === end && start) {
                min = min - 1
              }
            }
            setTxt(txt.substring(0, min) + v + txt.substring(max))
            const p = min + (isDelete ? 0 : 1)
            txtSelection.current.start = p
            txtSelection.current.end = p
          }}
          showKeyboard={showKeyboard}
        />
      )}
    </Layout>
  )
})
