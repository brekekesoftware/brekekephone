import { action, observable } from 'mobx'
import { observer } from 'mobx-react'
import { Component, Fragment } from 'react'
import { StyleSheet, View } from 'react-native'

import { mdiCheck, mdiClose } from '#/assets/icons'
import { ButtonIcon } from '#/components/ButtonIcon'
import { IncomingItem } from '#/components/CallVoicesUI'
import { RnText, RnTouchableOpacity } from '#/components/Rn'
import { v } from '#/components/variables'
import { isWeb } from '#/config'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { BackgroundTimer } from '#/utils/BackgroundTimer'

const css = StyleSheet.create({
  Notify: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: v.borderBg,
    backgroundColor: v.hoverBg,
  },
  Notify_Info: {
    flex: 1,
    paddingLeft: 12,
    paddingVertical: 5,
  },
  Notify_Btn_reject: {
    borderColor: v.colors.danger,
  },
  Notify_Btn_accept: {
    borderColor: v.colors.primary,
  },
})

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
      {ctx.call.shouldRingInNotify(c.callkeepUuid) && <IncomingItem />}
      <RnTouchableOpacity
        style={css.Notify}
        onPress={() => ctx.nav.goToPageCallManage()}
      >
        <View style={css.Notify_Info}>
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
            style={css.Notify_Btn_reject}
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
          style={css.Notify_Btn_accept}
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
