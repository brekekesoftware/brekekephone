import { action, observable } from 'mobx'
import { observer } from 'mobx-react'
import { Component, Fragment } from 'react'
import { Platform, StyleSheet, View } from 'react-native'

import { mdiCheck, mdiClose } from '../assets/icons'
import { getAuthStore } from '../stores/authStore'
import { getCallStore } from '../stores/callStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { ButtonIcon } from './ButtonIcon'
import { IncomingItem } from './CallVoicesUI'
import { RnText, RnTouchableOpacity } from './Rn'
import { v } from './variables'

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
export class DidMountTimer extends Component {
  private didMountTimer = 0
  @observable didMount = false
  componentDidMount() {
    this.didMountTimer = BackgroundTimer.setTimeout(
      action(() => {
        this.didMountTimer = 0
        this.didMount = true
      }),
      1000,
    )
  }
  componentWillUnmount() {
    if (this.didMountTimer) {
      BackgroundTimer.clearTimeout(this.didMountTimer)
    }
  }
  render() {
    return this.didMount ? this.props.children : null
  }
}

export const CallNotify = observer(() => {
  // Try trigger observer?
  void Object.keys(getCallStore().callkeepMap)
  void getCallStore().calls.map(_ => _.callkeepUuid)
  const c = getCallStore().getCallInNotify()
  // Do not show notify if in page call manage
  if (getCallStore().inPageCallManage || !c) {
    return null
  }
  const k = getCallStore().callkeepMap[c.callkeepUuid]
  const Wrapper =
    k?.hasAction ||
    Platform.OS === 'web' ||
    !getAuthStore().getCurrentAccount()?.pushNotificationEnabled
      ? Fragment
      : DidMountTimer
  const configure = getAuthStore().pbxConfig
  const hideHangup =
    c.incoming && configure?.['webphone.call.hangup'] === 'false'
  const n = getCallStore().calls.filter(
    _ => _.incoming && !_.answered && _.id !== c.id,
  ).length
  return (
    <Wrapper>
      {getCallStore().shouldRingInNotify(c.callkeepUuid) && <IncomingItem />}
      <RnTouchableOpacity
        style={css.Notify}
        onPress={() => Nav().goToPageCallManage()}
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
          onPress={() => c.answer()}
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
