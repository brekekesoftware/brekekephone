import { mdiCheck, mdiClose } from '@mdi/js'
import { action, observable } from 'mobx'
import { observer } from 'mobx-react'
import React from 'react'
import { Platform, StyleSheet, View } from 'react-native'

import { getAuthStore } from '../stores/authStore'
import callStore from '../stores/callStore'
import intl from '../stores/intl'
import ButtonIcon from './ButtonIcon'
import { RnText } from './Rn'
import g from './variables'

const css = StyleSheet.create({
  Notify: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: g.borderBg,
    backgroundColor: g.hoverBg,
  },
  Notify_Info: {
    flex: 1,
    paddingLeft: 12,
    paddingVertical: 5,
  },
  Notify_Btn_reject: {
    borderColor: g.colors.danger,
  },
  Notify_Btn_accept: {
    borderColor: g.colors.primary,
  },
})

@observer
class CallNotify extends React.Component {
  @observable visible = false
  prevHasPn = false
  componentDidMount() {
    this.componentDidUpdate()
  }

  @action
  componentDidUpdate() {
    const hasPn = !!callStore.recentPn
    if (hasPn) {
      this.visible = false
    } else if (this.prevHasPn) {
      this.visible = true
    }
    this.prevHasPn = hasPn
  }

  render() {
    const c = callStore.calls.find(c => c.incoming && !c.answered)
    if (
      !c ||
      (Platform.OS !== 'web' &&
        getAuthStore().currentProfile?.pushNotificationEnabled &&
        (callStore.recentPn || !this.visible))
    ) {
      return null
    }
    return (
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
          bdcolor={g.colors.danger}
          color={g.colors.danger}
          onPress={c.hangupWithUnhold}
          path={mdiClose}
          size={20}
          style={css.Notify_Btn_reject}
        />
        <ButtonIcon
          bdcolor={g.colors.primary}
          color={g.colors.primary}
          onPress={() => c.answer()}
          path={mdiCheck}
          size={20}
          style={css.Notify_Btn_accept}
        />
      </View>
    )
  }
}

export default CallNotify
