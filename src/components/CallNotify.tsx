import { observer } from 'mobx-react'
import React from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import UserAvatar from 'react-native-user-avatar'

import callStore from '../stores/callStore'
import intl from '../stores/intl'
import { RnText } from './Rn'

const css = StyleSheet.create({
  linearGradient: {
    zIndex: 1,
    position: 'relative',
    width: '100%',
    height: '100%',
  },
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
    margin: 5,
  },
})

@observer
class CallNotify extends React.Component {
  render() {
    const c = callStore.incomingCall
    if (!c || callStore.recentPn?.action) {
      return null
    }

    let callerId = 'KNOWN'
    let callerName = 'Leugo  Jong'
    let callerNumber = '0800 - 3232 23 21'

    // let callerId = "UNKNOWN";
    // let callerId = "USER";
    // let callerNumber = c.partyNumber || "203";

    return (
      <LinearGradient
        colors={['#FFFFFF', '#E7F3FF']}
        style={css.linearGradient}
        locations={[0, 0.3, 0.9]}
      >
        <View style={css.Notify}>
          <View style={css.Notify_Info}>
            {callerId == 'KNOWN' && (
              <>
                <UserAvatar size={66} name={callerName} bgColor={'#2276ff'} />
                <RnText style={css.CallerName}>{callerName}</RnText>
              </>
            )}

            {callerId != 'USER' && (
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

            {callerId == 'USER' && (
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
      </LinearGradient>
    )
  }
}

export default CallNotify
