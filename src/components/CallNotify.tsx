import { observer } from 'mobx-react'
import React from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import UserAvatar from 'react-native-user-avatar'

import callStore from '../stores/callStore'
import contactStore from '../stores/contactStore'
import intl from '../stores/intl'
import CustomGradient from './CustomGradient'
import { RnText } from './Rn'

const css = StyleSheet.create({
  Notify: {
    flex: 1,
  },
  NotifyContainer: {
    flex: 1,
    marginBottom: 100,
  },
  Notify_Btn_Side_By_Side: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  Notify_Info: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '30%',
  },
  Notify_Btn_reject: {
    width: 80,
    height: 80,
  },
  Notify_Btn_accept: {
    width: 80,
    height: 80,
  },
  MobileNumber: {
    color: '#2276FF',
    fontSize: 25,
    lineHeight: 28,
  },
  UserNumber: {
    color: '#2F3443',
    fontSize: 25,
    lineHeight: 28,
  },
  FlagLogo: {
    width: 20,
    height: 14,
    marginRight: 10,
  },
  ActionBtnText: {
    fontSize: 16,
    color: '#2F3443',
    marginTop: 7,
  },
  PoweredBy: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  PoweredByText: {
    color: '#BCC4CC',
    fontSize: 11,
  },
  qooqieLogo: {
    width: 56.3,
    height: 14,
    marginLeft: 10,
  },
  actionBtnContainer: {
    alignItems: 'center',
  },
  CallerName: {
    color: '#2F3443',
    fontSize: 26,
    lineHeight: 28,
    margin: 7,
  },
})

@observer
class CallNotify extends React.Component {
  state = {
    callerName: '',
  }
  render() {
    const c = callStore.incomingCall
    if (!c || callStore.recentPn?.action) {
      return null
    }

    if (c.partyName && c.partyName != c.partyNumber) {
      this.setState({ callerName: c.partyName })
    } else {
      contactStore.getPartyName(c.partyNumber, (value: String) =>
        this.setState({ callerName: value }),
      )
    }
    let callerNumber = c.partyNumber
    let isUserCalling = !callerNumber.includes('+')

    return (
      <CustomGradient>
        <View style={css.Notify}>
          <View style={css.Notify_Info}>
            {!!this.state.callerName && (
              <>
                <UserAvatar
                  size={66}
                  name={this.state.callerName}
                  bgColor={'#2276ff'}
                />
                <RnText style={css.CallerName}>{this.state.callerName}</RnText>
              </>
            )}

            {!isUserCalling && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Image
                  source={require('../assets/country.png')}
                  style={css.FlagLogo}
                ></Image>
                <RnText style={css.MobileNumber}>{callerNumber}</RnText>
              </View>
            )}

            {!!isUserCalling && (
              <RnText style={css.UserNumber}>{callerNumber}</RnText>
            )}
            {/* <RnText>
            {c.remoteVideoEnabled
              ? intl`Incoming video call`
              : intl`Incoming audio call`}
          </RnText> */}
          </View>
          <View style={css.NotifyContainer}>
            <View style={css.Notify_Btn_Side_By_Side}>
              <View style={css.actionBtnContainer}>
                <TouchableOpacity onPress={() => c.hangup()}>
                  <Image
                    source={require('../assets/decline-call.png')}
                    style={css.Notify_Btn_reject}
                  ></Image>
                </TouchableOpacity>
                <RnText style={css.ActionBtnText}>{'Weiger'}</RnText>
              </View>
              <View style={css.actionBtnContainer}>
                <TouchableOpacity onPress={() => c.answer()}>
                  <Image
                    source={require('../assets/accepted-call.png')}
                    style={css.Notify_Btn_accept}
                  ></Image>
                </TouchableOpacity>
                <RnText style={css.ActionBtnText}>{'Accepteer'}</RnText>
              </View>
            </View>
            <View style={css.PoweredBy}>
              <RnText style={css.PoweredByText}>{'powered by'}</RnText>
              <Image
                source={require('../assets/qooqie-logo.png')}
                style={css.qooqieLogo}
              ></Image>
            </View>
          </View>
        </View>
      </CustomGradient>
    )
  }
}

export default CallNotify
