import { observer } from 'mobx-react'
import { Component } from 'react'
import { StyleSheet, View } from 'react-native'

import { sip } from '../api/sip'
import {
  mdiArrowRight,
  mdiPhoneForward,
  mdiPhoneHangup,
  mdiPhoneOff,
} from '../assets/icons'
import { Avatar } from '../components/Avatar'
import { RnIcon, RnText, RnTouchableOpacity } from '../components/Rn'
import { v } from '../components/variables'
import { getCallStore } from '../stores/callStore'
import { contactStore, getPartyName } from '../stores/contactStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'

export const css = StyleSheet.create({
  Outer: {
    alignItems: 'center',
    backgroundColor: 'white',
  },
  Inner: {
    width: '100%',
    flexDirection: 'row',
    maxWidth: 320,
  },
  Inner__info: {
    maxWidth: 280,
    marginBottom: 100,
  },
  Info: {
    position: 'absolute',
    alignItems: 'center',
  },
  Info__from: {
    left: 20,
    top: 30,
  },
  Info__to: {
    right: 20,
    top: 30,
  },
  Arrow: {
    marginLeft: 'auto',
    marginRight: 'auto',
    top: 60,
  },

  BtnOuter: {
    width: `${100 / 3}%`,
    alignItems: 'center',
  },
  Btn: {
    borderRadius: 25,
    width: 50,
    height: 50,
  },
  Btn__stop: {
    backgroundColor: v.colors.warning,
  },
  Btn__hangup: {
    backgroundColor: v.colors.danger,
  },
  Btn__conference: {
    backgroundColor: v.colors.primary,
  },
  Space: {
    height: 10,
  },
})

@observer
export class PageCallTransferAttend extends Component {
  prevId?: string
  componentDidMount() {
    this.componentDidUpdate()
  }
  componentDidUpdate() {
    const oc = getCallStore().getOngoingCall()
    if (this.prevId && this.prevId !== oc?.id) {
      Nav().backToPageCallManage()
    }
    this.prevId = oc?.id
  }

  resolveMatch = (id: string) => {
    const ucUser = contactStore.getUcUserById(id) || {}
    return {
      avatar: ucUser.avatar,
      number: id,
    }
  }

  render() {
    const oc = getCallStore().getOngoingCall()
    if (!oc) {
      return null
    }
    const usersource = this.resolveMatch(oc.partyNumber)
    const usertarget = this.resolveMatch(oc.transferring)
    return (
      <View style={css.Outer}>
        <RnText center subTitle>{intl`Transferring`}</RnText>
        <View style={css.Space} />
        <View style={[css.Inner, css.Inner__info]}>
          <View style={[css.Info, css.Info__from]}>
            <Avatar source={{ uri: usersource?.avatar }} />
            <RnText center singleLine small>
              {oc.getDisplayName()}
            </RnText>
          </View>
          <View style={css.Arrow}>
            <RnIcon path={mdiArrowRight} />
          </View>
          <View style={[css.Info, css.Info__to]}>
            <Avatar source={{ uri: usertarget?.avatar }} />
            <RnText center singleLine small>
              {getPartyName(oc.transferring) || oc.transferring}
            </RnText>
          </View>
        </View>
        <View style={css.Space} />
        <View style={css.Inner}>
          <View style={css.BtnOuter}>
            <RnTouchableOpacity
              onPress={oc.stopTransferring}
              style={[css.Btn, css.Btn__stop]}
            >
              <RnIcon path={mdiPhoneOff} />
            </RnTouchableOpacity>
            <RnText center singleLine small>
              {intl`CANCEL`}
            </RnText>
          </View>
          <View style={css.BtnOuter}>
            <RnTouchableOpacity
              onPress={() => sip.hangupSession(oc.id)}
              style={[css.Btn, css.Btn__hangup]}
            >
              <RnIcon path={mdiPhoneHangup} />
            </RnTouchableOpacity>
            <RnText center singleLine small>
              {intl`TRANSFER`}
            </RnText>
          </View>
          <View style={css.BtnOuter}>
            <RnTouchableOpacity
              onPress={oc.conferenceTransferring}
              style={[css.Btn, css.Btn__conference]}
            >
              <RnIcon path={mdiPhoneForward} />
            </RnTouchableOpacity>
            <RnText center singleLine small>
              {intl`CONFERENCE`}
            </RnText>
          </View>
        </View>
      </View>
    )
  }
}
