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
import { InvokeGradient } from './InvokeGradient'
import { KeyPadTablet } from './KeyPadTablet'

const css = StyleSheet.create({
  container: {
    flex: 1,
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
    height: 65,
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
    width: '100%',
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

  return (
    <InvokeGradient>
      <View style={css.container}>
        <View style={css.content}>
          <View style={css.left}>
            <View style={{ height: 130 }}></View>
            <View style={css.keypad}>
              <KeyPadTablet
                onPressNumber={() => {}}
                showKeyboard={() => {}}
                isHideBackspace
              />
            </View>
            <View style={css.receiveCall}>
              <InvokeGradient
                colors={['rgb(90, 207,146)', 'rgb(0,154, 41)', 'rgb(0,141,31)']}
                style={[css.callBtn, css.btn]}
                locations={[0, 0.5, 0.6]}
              >
                <RnTouchableOpacity style={[css.callBtn, css.btn]}>
                  <Text style={css.endCallText}>{intl`Answer`}</Text>
                </RnTouchableOpacity>
              </InvokeGradient>
              <InvokeGradient
                colors={[
                  'rgb(228,126,123)',
                  'rgb(242,38,32)',
                  'rgb(215,46,39)',
                ]}
                style={[css.callBtn, css.btn]}
                locations={[0, 0.5, 0.6]}
              >
                <RnTouchableOpacity
                  onPress={onBackToCall}
                  style={[css.callBtn, css.btn]}
                >
                  <Text style={css.endCallText}>{intl`Denial`}</Text>
                </RnTouchableOpacity>
              </InvokeGradient>
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
              <RnTouchableOpacity
                style={css.button}
                onPress={() => setMic(!mic)}
              >
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
    </InvokeGradient>
  )
}
