import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import {
  mdiMicrophone,
  mdiMicrophoneOff,
  mdiVolumeHigh,
  mdiVolumeMute,
} from '../assets/icons'
import { RnIcon } from '../components/RnIcon'
import { RnTouchableOpacity } from '../components/RnTouchableOpacity'
import { KeyPadTablet } from './KeyPadTablet'

const css = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgb(16,46,95)',
  },
  left: {
    width: '40%',
    padding: 5,
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
  },
  empty: {
    flex: 1,
  },
  buttons: {
    flexDirection: 'row',
  },
  button: {
    width: 210,
    height: 60,
    backgroundColor: 'rgb(82,99,96)',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  person: {
    color: 'rgb(152,73,107)',
    fontSize: 30,
  },
  textAction: {
    color: 'white',
  },
  keypad: {
    flex: 1,
    marginBottom: 5,
  },
  callBtn: {
    height: 45,
    borderRadius: 4,
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
  },
  receiveCall: {
    flexDirection: 'row',
    height: 45,
    gap: 10,
  },
  btn: {
    flex: 1,
  },
})

export const InCallUI = () => {
  const handlePressButton = () => {}

  const [mic, setMic] = useState(false)
  const [sound, setSound] = useState(false)

  return (
    <View style={css.container}>
      <View style={css.left}>
        <View style={{ height: 200 }}></View>
        <View style={css.keypad}>
          <KeyPadTablet
            onPressNumber={() => {}}
            showKeyboard={() => {}}
            isHideBackspace
          />
        </View>
        {/* <RnTouchableOpacity style={[css.callBtn, css.bgEndCall]}>
          <Text style={css.endCallText}>End call</Text>
        </RnTouchableOpacity> */}
        <View style={css.receiveCall}>
          <RnTouchableOpacity style={[css.callBtn, css.bgAcceptCall, css.btn]}>
            <Text style={css.endCallText}>Accept call</Text>
          </RnTouchableOpacity>
          <RnTouchableOpacity style={[css.callBtn, css.bgEndCall, css.btn]}>
            <Text style={css.endCallText}>Reject call</Text>
          </RnTouchableOpacity>
        </View>
      </View>
      <View style={css.right}>
        <View style={css.infoCall}>
          <Text style={css.phone}>3021</Text>
          <Text style={css.person}>Duy Phan</Text>
        </View>
        <View style={css.empty} />
        <View style={css.buttons}>
          <RnTouchableOpacity style={css.button} onPress={() => setMic(!mic)}>
            <RnIcon
              path={mic ? mdiMicrophone : mdiMicrophoneOff}
              color='white'
            />
            <Text style={css.textAction}>Microphone</Text>
          </RnTouchableOpacity>
          <RnTouchableOpacity
            style={css.button}
            onPress={() => setSound(!sound)}
          >
            <RnIcon
              path={sound ? mdiVolumeHigh : mdiVolumeMute}
              color='white'
            />
            <Text style={css.textAction}>Volume</Text>
          </RnTouchableOpacity>
        </View>
      </View>
    </View>
  )
}
