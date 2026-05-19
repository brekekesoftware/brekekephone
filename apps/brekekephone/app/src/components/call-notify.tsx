import { action, observable } from 'mobx'
import { observer } from 'mobx-react'
import { Component, Fragment } from 'react'

import { View } from '@/rn/core/components/view'
import { mdiCheck, mdiClose } from '#/assets/icons'
import { ButtonIcon } from '#/components/button-icon'
import { IncomingItem } from '#/components/call-voices-ui'
import { RnText, RnTouchableOpacity } from '#/components/rn'
import { v } from '#/components/variables'
import { isWeb } from '#/config'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { BackgroundTimer } from '#/utils/background-timer'

@observer
export class DidMountTimer extends Component<any> {
  private didMountTimer = 0
  @observable didMount = false
  componentDidMount = () => {
    this.didMountTimer = BackgroundTimer.setTimeout(
      action(() => {
        this.didMountTimer = 0
        this.didMount = true
      }),
      1000,
    )
  }
  componentWillUnmount = () => {
    if (this.didMountTimer) {
      BackgroundTimer.clearTimeout(this.didMountTimer)
    }
  }
  render() {
    return this.didMount ? this.props.children : null
  }
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
        className='flex-row items-center border-b border-border bg-muted'
        onPress={() => ctx.nav.goToPageCallManage()}
      >
        <View className='flex-1 pl-3 py-1.25'>
          <RnText bold>{c.getDisplayName()}</RnText>
          <RnText>
            {intl`Incoming Call`}
            {n > 0 ? ' (' + intl`${n} in background` + ')' : ''}
          </RnText>
        </View>
        {!hideHangup && (
          <ButtonIcon
            bdcolor={v.colors.danger}
            color={v.colors.danger}
            onPress={c.hangupWithUnhold}
            path={mdiClose}
            size={20}
            style={{ borderColor: v.colors.danger }}
          />
        )}
        <ButtonIcon
          bdcolor={v.colors.primary}
          color={v.colors.primary}
          onPress={() => {
            c.answer()
            if (ctx.call.calls.some(_ => _.answered && _.id !== c.id)) {
              ctx.call.onSelectBackgroundCall(c)
            }
          }}
          path={mdiCheck}
          size={20}
          style={{ borderColor: v.colors.primary }}
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
