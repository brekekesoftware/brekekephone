import { observer } from 'mobx-react'
import type { ReactNode } from 'react'
import { Fragment, useEffect, useState } from 'react'

import { View } from '@/rn/core/components/view'
import { isWeb } from '@/rn/core/utils/platform'
import { mdiCheck, mdiClose } from '#/assets/icons'
import { ButtonIcon } from '#/components/button-icon'
import { IncomingItem } from '#/components/call-voices-ui'
import { RnText, RnTouchableOpacity } from '#/components/rn'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { BackgroundTimer } from '#/utils/background-timer'

export const DidMountTimer = ({ children }: { children?: ReactNode }) => {
  const [didMount, setDidMount] = useState(false)
  useEffect(() => {
    const t = BackgroundTimer.setTimeout(() => setDidMount(true), 1000)
    return () => BackgroundTimer.clearTimeout(t)
  }, [])
  return didMount ? children : null
}

export const CallNotify = observer(() => {
  // try trigger observer?
  void Object.keys(ctx.call.callkeepMap)
  void ctx.call.calls.map(_ => _.callkeepUuid)
  const c = ctx.call.getCallInNotify()
  // do not show notify if in page call manage
  if (ctx.call.inPageCallManage || !c) {
    return null
  }
  const k = ctx.call.callkeepMap[c.callkeepUuid]
  const Wrapper =
    k?.hasAction ||
    isWeb ||
    !ctx.auth.getCurrentAccount()?.pushNotificationEnabled
      ? Fragment
      : DidMountTimer
  const configure = ctx.auth.pbxConfig
  const hideHangup =
    c.incoming && configure?.['webphone.call.hangup'] === 'false'
  const n = ctx.call.calls.filter(
    _ => _.incoming && !_.answered && _.id !== c.id,
  ).length

  return (
    <Wrapper>
      {ctx.call.shouldRingInNotify() && <IncomingItem />}
      <RnTouchableOpacity
        className='border-border bg-muted flex-row items-center border-b'
        onPress={() => ctx.nav.goToPageCallManage()}
      >
        <View className='flex-1 py-1.25 pl-3'>
          <RnText bold>{c.getDisplayName()}</RnText>
          <RnText>
            {intl`Incoming Call`}
            {n > 0 ? ' (' + intl`${n} in background` + ')' : ''}
          </RnText>
        </View>
        {!hideHangup && (
          <ButtonIcon
            className='border-error text-error'
            onPress={c.hangupWithUnhold}
            path={mdiClose}
            size={20}
          />
        )}
        <ButtonIcon
          className='border-primary text-primary'
          onPress={() => {
            c.answer()
            if (ctx.call.calls.some(_ => _.answered && _.id !== c.id)) {
              ctx.call.onSelectBackgroundCall(c)
            }
          }}
          path={mdiCheck}
          size={20}
        />
      </RnTouchableOpacity>
    </Wrapper>
  )
})

export const IncomingItemWithTimer = () => (
  <DidMountTimer>
    <IncomingItem />
  </DidMountTimer>
)
