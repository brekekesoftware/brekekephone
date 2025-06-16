import { observer } from 'mobx-react'

import { mdiPhone, mdiPhoneHangup } from '#/assets/icons'
import { UserItem } from '#/components/ContactUserItem'
import { Field } from '#/components/Field'
import { Layout } from '#/components/Layout'
import { RnTouchableOpacity } from '#/components/Rn'
import { v } from '#/components/variables'
import type { Call } from '#/stores/Call'
import { getCallStore } from '#/stores/callStore'
import { intl } from '#/stores/intl'
import { Nav } from '#/stores/Nav'
import { Duration } from '#/stores/timerStore'

export const PageCallBackgrounds = observer(() => {
  const bg = getCallStore().calls.filter(
    c => c.id !== getCallStore().ongoingCallId,
  )
  const oc = getCallStore().getOngoingCall()
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
              getCallStore().onSelectBackgroundCall(c)
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
      onBack={Nav().backToPageCallManage}
      title={intl`Background calls`}
    >
      <Field isGroup label={intl`CURRENT CALL`} />
      {(oc ? [oc] : []).map(c => (
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
              : () => getCallStore().onSelectBackgroundCall(c)
          }
        >
          {renderItemCall(c)}
        </RnTouchableOpacity>
      ))}
    </Layout>
  )
})
