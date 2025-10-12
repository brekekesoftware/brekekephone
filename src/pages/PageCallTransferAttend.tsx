import { observer } from 'mobx-react'
import { Component } from 'react'
import { Platform, StyleSheet, View } from 'react-native'

import {
  mdiArrowRight,
  mdiPhoneForward,
  mdiPhoneHangup,
  mdiPhoneOff,
} from '#/assets/icons'
import { Avatar } from '#/components/Avatar'
import { RnIcon, RnText, RnTouchableOpacity } from '#/components/Rn'
import { v } from '#/components/variables'
import { getPartyName } from '#/stores/contactStore'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'

export const css = StyleSheet.create({
  Outer: {
    alignItems: 'center',
    backgroundColor: 'white',
    ...Platform.select({
      web: {
        width: '100%',
      },
    }),
  },
  Inner: {
    width: '70%',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    alignContent: 'center',
    marginBottom: 30,
    ...Platform.select({
      web: {
        // browser justify content center doesnt work as react native
        maxWidth: 400,
        minWidth: 250,
        justifyContent: 'space-between',
      },
      default: {
        justifyContent: 'center',
      },
    }),
  },
  Inner__info: {
    maxWidth: 'auto',
    marginBottom: 80,
  },
  Info: {
    position: 'absolute',
    alignItems: 'center',
  },
  Info__from: {
    flex: 5,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  Info__to: {
    flex: 5,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  Arrow: {
    flex: 1,
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

  state = {
    phoneappliSource: {
      avatar: '',
      username: '',
    },
    phoneappliTarget: {
      avatar: '',
      username: '',
    },
  }

  getPhoneappliInfo = async () => {
    if (!ctx.auth.phoneappliEnabled()) {
      return
    }
    const oc = ctx.call.getOngoingCall()
    if (!oc) {
      return
    }
    try {
      const ca = ctx.auth.getCurrentAccount()
      if (!ca) {
        return
      }
      const { pbxTenant, pbxUsername } = ca
      const rs = await ctx.pbx.getPhoneappliContact(
        pbxTenant,
        pbxUsername,
        oc.partyNumber,
      )
      const phoneappliSource = {
        avatar: rs?.image_url,
        username: rs?.display_name,
      }
      const rt = await ctx.pbx.getPhoneappliContact(
        pbxTenant,
        pbxUsername,
        oc.transferring,
      )
      const phoneappliTarget = {
        avatar: rt?.image_url,
        username: rt?.display_name,
      }
      this.setState({ phoneappliSource, phoneappliTarget })
    } catch (err) {
      console.error(err)
      return
    }
  }

  componentDidMount = () => {
    this.getPhoneappliInfo()
    this.componentDidUpdate()
  }
  componentDidUpdate = () => {
    const oc = ctx.call.getOngoingCall()
    if (this.prevId && this.prevId !== oc?.id) {
      ctx.nav.backToPageCallManage()
    }
    this.prevId = oc?.id
  }

  resolveMatch = (id: string) => {
    const ucUser = ctx.contact.getUcUserById(id) || {}
    return {
      avatar: ucUser.avatar,
      number: id,
    }
  }

  render() {
    const oc = ctx.call.getOngoingCall()
    if (!oc) {
      return null
    }
    const usersource = this.resolveMatch(oc.partyNumber)
    const usertarget = this.resolveMatch(oc.transferring)
    const { phoneappliSource, phoneappliTarget } = this.state
    return (
      <View style={css.Outer}>
        <RnText center subTitle>{intl`Transferring`}</RnText>
        <View style={css.Space} />
        <View style={[css.Inner]}>
          <View style={[css.Info__from]}>
            <Avatar
              source={{ uri: phoneappliSource.avatar || usersource?.avatar }}
            />
            <RnText center singleLine small>
              {phoneappliSource.username || oc.getDisplayName()}
            </RnText>
          </View>
          <View style={css.Arrow}>
            <RnIcon path={mdiArrowRight} />
          </View>
          <View style={[css.Info__to]}>
            <Avatar
              source={{ uri: phoneappliTarget.avatar || usertarget?.avatar }}
            />
            <RnText center singleLine small>
              {phoneappliTarget.username ||
                getPartyName({ partyNumber: oc.transferring }) ||
                oc.transferring}
            </RnText>
          </View>
        </View>
        <View style={css.Space} />
        <View style={css.Inner}>
          <View style={css.BtnOuter}>
            <RnTouchableOpacity
              onPress={() => {
                oc.stopTransferring()
                ctx.nav.backToPageCallManage()
              }}
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
              onPress={() => ctx.sip.hangupSession(oc.id)}
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
              onPress={() => {
                oc.conferenceTransferring()
                ctx.nav.backToPageCallManage()
              }}
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
