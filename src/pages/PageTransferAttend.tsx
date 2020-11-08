import {
  mdiArrowRight,
  mdiPhoneForward,
  mdiPhoneHangup,
  mdiPhoneOff,
} from '@mdi/js'
import { observer } from 'mobx-react'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import Avatar from '../components/Avatar'
import { RnIcon, RnText, RnTouchableOpacity } from '../components/Rn'
import g from '../components/variables'
import callStore from '../stores/callStore'
import contactStore from '../stores/contactStore'
import intl from '../stores/intl'

const css = StyleSheet.create({
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
    backgroundColor: g.colors.warning,
  },
  Btn__hangup: {
    backgroundColor: g.colors.danger,
  },
  Btn__conference: {
    backgroundColor: g.colors.primary,
  },
  Space: {
    height: 10,
  },
})

@observer
class PageTransferAttend extends React.Component {
  resolveMatch = (id: string) => {
    const ucUser = contactStore.getUCUser(id) || {}
    return {
      avatar: ucUser.avatar,
      number: id,
    }
  }

  render() {
    const c = callStore.currentCall
    if (!c) {
      return null
    }
    const usersource = this.resolveMatch(c.partyNumber)
    const usertarget = this.resolveMatch(c.transferring)
    return (
      <View style={css.Outer}>
        <RnText center subTitle>{intl`Transferring`}</RnText>
        <View style={css.Space} />
        <View style={[css.Inner, css.Inner__info]}>
          <View style={[css.Info, css.Info__from]}>
            <Avatar source={{ uri: usersource?.avatar }} />
            <RnText center singleLine small>
              {c.partyName}
            </RnText>
          </View>
          <View style={css.Arrow}>
            <RnIcon path={mdiArrowRight} />
          </View>
          <View style={[css.Info, css.Info__to]}>
            <Avatar source={{ uri: usertarget?.avatar }} />
            <RnText center singleLine small>
              {c.transferring}
            </RnText>
          </View>
        </View>
        <View style={css.Space} />
        <View style={css.Inner}>
          <View style={css.BtnOuter}>
            <RnTouchableOpacity
              onPress={c.stopTransferring}
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
              onPress={c.hangup}
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
              onPress={c.conferenceTransferring}
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

export default PageTransferAttend
