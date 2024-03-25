import { observer } from 'mobx-react'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import {
  mdiMicrophone,
  mdiMicrophoneOff,
  mdiPhone,
  mdiVolumeHigh,
  mdiVolumeMute,
} from '../assets/icons'
import { ButtonIcon } from '../components/ButtonIcon'
import { v } from '../components/variables'
import { getAuthStore, waitSip } from '../stores/authStore'
import { getCallStore } from '../stores/callStore'
import { Duration } from '../stores/timerStore'
import { waitTimeout } from '../utils/waitTimeout'
import { invokeToApp } from './CallUI'
import { InvokeGradient } from './InvokeGradient'

const css = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
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
    width: '100%',
    marginBottom: 10,
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
  textConnecting: {
    color: 'white',
    textAlign: 'center',
    fontSize: 30,
  },
})

export const InCallUI = observer(
  ({ onBackToCall }: { onBackToCall(): void }) => {
    const [mic, setMic] = useState(false)
    const [sound, setSound] = useState(false)

    const {
      pbxConnectingOrFailure,
      sipConnectingOrFailure,
      ucConnectingOrFailure,
    } = getAuthStore()
    const isConnecting =
      pbxConnectingOrFailure() ||
      sipConnectingOrFailure() ||
      ucConnectingOrFailure()

    if (isConnecting) {
      return (
        <InvokeGradient>
          <View style={css.container}>
            <Text style={css.textConnecting}>Connecting...</Text>
          </View>
        </InvokeGradient>
      )
    }

    const infoCall = getCallStore().calls[0]

    const handlePressCall = async () => {
      try {
        let c = getCallStore().calls[0]
        if (!c) {
          await waitSip()
          await waitTimeout(1000)
        }
        c = getCallStore().calls[0]
        if (!c) {
          invokeToApp()
          return
        }
        c.hangupWithUnhold()
      } catch (e) {
        console.log('#Duy Phan console', e)
      }
    }

    return (
      <InvokeGradient>
        <View style={css.container}>
          <View style={css.content}>
            <View style={css.right}>
              <View style={css.infoCall}>
                <View style={css.info}>
                  <Text style={css.phone}>
                    {infoCall?.getDisplayName() ?? ''}
                  </Text>
                </View>
              </View>
              {infoCall?.answered && (
                <Duration subTitle white center>
                  {infoCall.answeredAt}
                </Duration>
              )}
              <View style={css.empty}>
                <View style={css.buttons}>
                  <ButtonIcon
                    path={mic ? mdiMicrophone : mdiMicrophoneOff}
                    bgcolor={'rgb(82,99,96)'}
                    color='white'
                    onPress={() => setMic(!mic)}
                    size={40}
                  />

                  <ButtonIcon
                    path={sound ? mdiVolumeHigh : mdiVolumeMute}
                    bgcolor={'rgb(82,99,96)'}
                    color='white'
                    onPress={() => setSound(!sound)}
                    size={40}
                  />
                </View>
              </View>

              <View style={{ marginBottom: 10 }}>
                <ButtonIcon
                  path={mdiPhone}
                  bgcolor={v.colors.danger}
                  color='white'
                  onPress={handlePressCall}
                  size={40}
                />
              </View>
            </View>
          </View>
        </View>
      </InvokeGradient>
    )
  },
)
