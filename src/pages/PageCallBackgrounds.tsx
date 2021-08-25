import { mdiPhone, mdiPhoneHangup } from '@mdi/js'
import { observer } from 'mobx-react'
import React from 'react'

import { UserItem } from '../components/ContactUserItem'
import { Field } from '../components/Field'
import { Layout } from '../components/Layout'
import { RnTouchableOpacity } from '../components/Rn'
import { v } from '../components/variables'
import { Call } from '../stores/Call'
import { callStore } from '../stores/callStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { Duration } from '../stores/timerStore'

export const PageCallBackgrounds = observer(() => {
  const bg = callStore.calls.filter(c => c.id !== callStore.currentCallId)
  const currentCall = callStore.getCurrentCall()
  const renderItemCall = (c: Immutable<Call>, isCurrentCall?: boolean) => {
    const icons = [
      mdiPhoneHangup,
      ...(!c.answered && c.incoming ? [mdiPhone] : []),
    ]
    const iconColors = [
      v.colors.danger,
      ...(!c.answered && c.incoming ? [v.colors.primary] : []),
    ]
    const iconFuncs = [
      c.hangupWithUnhold,
      ...(!c.answered && c.incoming
        ? [
            () => {
              c.answer()
              callStore.onSelectBackgroundCall(c)
            },
          ]
        : []),
    ]
    return (
      <UserItem
        icons={icons}
        iconColors={iconColors}
        iconFuncs={iconFuncs}
        key={c.id}
        lastMessage={
          !c.answered ? (
            c.incoming ? (
              intl`Incoming call`
            ) : (
              intl`Dialing...`
            )
          ) : c.transferring ? (
            intl`Transferring`
          ) : c.holding ? (
            intl`On hold`
          ) : (
            <Duration>{c.answeredAt}</Duration>
          )
        }
        selected={isCurrentCall}
        {...c}
      />
    )
  }
  return (
    <Layout
      compact
      onBack={Nav().backToPageCallManage}
      title={intl`Background calls`}
    >
      <Field isGroup label={intl`CURRENT CALL`} />
      {(currentCall ? [currentCall] : []).map(c => (
        <RnTouchableOpacity
          key={c.id}
          onPress={() => Nav().backToPageCallManage()}
        >
          {renderItemCall(c, true)}
        </RnTouchableOpacity>
      ))}
      {!!bg.length && (
        <Field hasMargin isGroup label={intl`BACKGROUND CALLS`} />
      )}
      {bg.map(c => (
        <RnTouchableOpacity
          key={c.id}
          onPress={
            !c.answered && c.incoming
              ? undefined
              : () => callStore.onSelectBackgroundCall(c)
          }
        >
          {renderItemCall(c)}
        </RnTouchableOpacity>
      ))}
    </Layout>
  )
})
