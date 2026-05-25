import { observer } from 'mobx-react'

import { tw } from '@/rn/core/tw/tw'
import { mdiPhone, mdiPhoneHangup } from '#/assets/icons'
import { UserItem } from '#/components/contact-user-item'
import { Field } from '#/components/field'
import { Layout } from '#/components/layout'
import { RnTouchableOpacity } from '#/components/rn'
import type { Call } from '#/stores/call'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { Duration } from '#/stores/timer-store'

export const PageCallBackgrounds = observer(() => {
  const bg = ctx.call.calls.filter(c => c.id !== ctx.call.ongoingCallId)
  const oc = ctx.call.getOngoingCall()
  const renderItemCall = (c: Call, isCurrentCall?: boolean) => {
    const icons = [
      mdiPhoneHangup,
      ...(!c.answered && c.incoming ? [mdiPhone] : []),
    ]
    const iconClassNames = [
      tw`text-error`,
      ...(!c.answered && c.incoming ? [tw`text-primary`] : []),
    ]
    const iconFuncs = [
      c.hangupWithUnhold,
      ...(!c.answered && c.incoming
        ? [
            () => {
              c.answer()
              ctx.call.onSelectBackgroundCall(c)
            },
          ]
        : []),
    ]
    return (
      <UserItem
        icons={icons}
        iconClassNames={iconClassNames}
        iconFuncs={iconFuncs}
        key={c.id}
        lastMessage={
          !c.answered ? (
            c.incoming ? (
              intl`Incoming Call`
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
      onBack={ctx.nav.backToPageCallManage}
      title={intl`Background calls`}
    >
      <Field isGroup label={intl`CURRENT CALL`} />
      {(oc ? [oc] : []).map(c => (
        <RnTouchableOpacity
          key={c.id}
          onPress={() => ctx.nav.backToPageCallManage()}
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
              : () => ctx.call.onSelectBackgroundCall(c)
          }
        >
          {renderItemCall(c)}
        </RnTouchableOpacity>
      ))}
    </Layout>
  )
})
