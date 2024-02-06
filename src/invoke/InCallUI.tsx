import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import {
  mdiMicrophone,
  mdiMicrophoneOff,
  mdiVolumeHigh,
  mdiVolumeMute,
} from '../assets/icons'
import { KeyPad } from '../components/CallKeyPad'
import { RnIcon } from '../components/RnIcon'
import { RnTouchableOpacity } from '../components/RnTouchableOpacity'

const css = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  left: {
    flex: 1,
  },
  right: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    flex: 1,
    height: 60,
    backgroundColor: 'rgb(82,99,96)',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  person: {
    color: 'rgb(152,73,107)',
    fontSize: 20,
  },
  textAction: {
    color: 'white',
  },
})

export const InCallUI = () => {
  const handlePressButton = () => {}

  const [mic, setMic] = useState(false)
  const [sound, setSound] = useState(false)

  return (
    <View style={css.container}>
      <View style={css.left}>
        <KeyPad onPressNumber={() => {}} showKeyboard={() => {}} />
      </View>
      <View style={css.right}>
        <View style={css.infoCall}>
          <Text>3021</Text>
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
