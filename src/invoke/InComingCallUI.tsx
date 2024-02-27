import qs from 'qs'
import { useState } from 'react'
import { Linking, StyleSheet, Text, View } from 'react-native'

import {
  mdiMicrophone,
  mdiMicrophoneOff,
  mdiVolumeHigh,
  mdiVolumeMute,
} from '../assets/icons'
import { RnIcon } from '../components/RnIcon'
import { RnTouchableOpacity } from '../components/RnTouchableOpacity'
import { intl } from '../stores/intl'
import { KeyPadTablet } from './KeyPadTablet'

const css = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(16,46,95)',
  },
  left: {
    width: '40%',
    paddingBottom: 5,
  },
  right: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  infoCall: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  empty: {
    flex: 1,
  },
  buttons: {
    flexDirection: 'row',
    gap: 1,
    paddingBottom: 2,
  },
  button: {
    width: 210,
    height: 70,
    backgroundColor: 'rgb(82,99,96)',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  person: {
    color: 'rgb(152,73,107)',
    fontSize: 30,
  },
  time: {
    color: 'rgb(152,73,107)',
  },
  textAction: {
    color: 'white',
  },
  keypad: {
    flex: 1,
    marginBottom: 2,
    backgroundColor: 'rgb(135,135,135)',
  },
  callBtn: {
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgEndCall: {
    backgroundColor: 'rgb(216,44,69)',
  },
  bgAcceptCall: {
    backgroundColor: 'green',
  },
  endCallText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
  },
  phone: {
    color: 'white',
    fontSize: 30,
    paddingTop: 12,
  },
  receiveCall: {
    flexDirection: 'row',
    height: 45,
    gap: 10,
  },
  btn: {
    flex: 1,
  },
  info: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    backgroundColor: 'rgb(34,86,154)',
    paddingHorizontal: 5,
    paddingVertical: 4,
  },
  infoText: {
    color: 'white',
  },
  content: { flex: 1, flexDirection: 'row' },
  incomingCall: {
    color: 'white',
    fontSize: 30,
  },
})

export const InComingCallUI = ({ onBackToCall }: { onBackToCall(): void }) => {
  const [mic, setMic] = useState(false)
  const [sound, setSound] = useState(false)

  const handlePressCall = async () => {
    try {
      const params = qs.stringify({ name: 'Duy', age: 27 })
      await Linking.openURL(`zlinkapp_dev://open?${params}`)
      onBackToCall()
    } catch (e) {
      console.log('#Duy Phan console', e)
    }
  }

  return (
    <View style={css.container}>
      <View style={css.header}>
        <Text style={css.infoText}>3002</Text>
        <View style={css.empty} />
        <Text style={css.infoText}>ver 1.1.1 ZL</Text>
      </View>
      <View style={css.content}>
        <View style={css.left}>
          <View style={{ height: 200 }}></View>
          <View style={css.keypad}>
            <KeyPadTablet
              onPressNumber={() => {}}
              showKeyboard={() => {}}
              isHideBackspace
            />
          </View>
          <View style={css.receiveCall}>
            <RnTouchableOpacity
              style={[css.callBtn, css.bgAcceptCall, css.btn]}
            >
              <Text style={css.endCallText}>{intl`Answer`}</Text>
            </RnTouchableOpacity>
            <RnTouchableOpacity
              style={[css.callBtn, css.bgEndCall, css.btn]}
              onPress={handlePressCall}
            >
              <Text style={css.endCallText}>{intl`Denial`}</Text>
            </RnTouchableOpacity>
          </View>
        </View>
        <View style={css.right}>
          <View style={css.infoCall}>
            <View style={css.info}>
              <Text style={css.phone}>3021</Text>
              <Text style={css.incomingCall}>{intl`Incoming Call`}</Text>
            </View>
          </View>
          <View style={css.empty} />
          <View style={css.buttons}>
            <RnTouchableOpacity style={css.button} onPress={() => setMic(!mic)}>
              <RnIcon
                path={mic ? mdiMicrophone : mdiMicrophoneOff}
                color='white'
                size={30}
              />
              <Text style={css.textAction}>{intl`MUTE`}</Text>
            </RnTouchableOpacity>
            <RnTouchableOpacity
              style={css.button}
              onPress={() => setSound(!sound)}
            >
              <RnIcon
                path={sound ? mdiVolumeHigh : mdiVolumeMute}
                color='white'
                size={30}
              />
              <Text style={css.textAction}>{intl`SPEAKER`}</Text>
            </RnTouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}
