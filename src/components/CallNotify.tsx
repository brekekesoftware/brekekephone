import { mdiCheck, mdiClose } from '@mdi/js'
import { action, observable } from 'mobx'
import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { Platform, StyleSheet, View } from 'react-native'

import { getAuthStore } from '../stores/authStore'
import { callStore } from '../stores/callStore'
import { intl } from '../stores/intl'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { ButtonIcon } from './ButtonIcon'
import { RnText } from './Rn'
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
  @observable didMount =
    Platform.OS === 'web' ||
    !getAuthStore().currentProfile?.pushNotificationEnabled
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

@observer
export class CallNotify extends Component {
  render() {
    // Do not display our callbar if already show callkeep
    const c = callStore.calls.find(
      _ => _.incoming && !_.answered && !callStore.callkeepMap[_.callkeepUuid],
    )
    if (!c) {
      return null
    }
    return (
      <DidMountTimer>
        <View style={css.Notify}>
          <View style={css.Notify_Info}>
            <RnText bold>{c.partyName || c.partyNumber}</RnText>
            <RnText>
              {c.remoteVideoEnabled
                ? intl`Incoming video call`
                : intl`Incoming audio call`}
            </RnText>
          </View>
          <ButtonIcon
            bdcolor={v.colors.danger}
            color={v.colors.danger}
            onPress={c.hangupWithUnhold}
            path={mdiClose}
            size={20}
            style={css.Notify_Btn_reject}
          />
          <ButtonIcon
            bdcolor={v.colors.primary}
            color={v.colors.primary}
            onPress={() => c.answer()}
            path={mdiCheck}
            size={20}
            style={css.Notify_Btn_accept}
          />
        </View>
      </DidMountTimer>
    )
  }
}
