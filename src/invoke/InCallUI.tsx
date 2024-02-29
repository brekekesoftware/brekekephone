import { observer } from 'mobx-react'
import { useState } from 'react'
import { Linking, StyleSheet, Text, View } from 'react-native'

import {
  mdiMicrophone,
  mdiMicrophoneOff,
  mdiPhone,
  mdiVolumeHigh,
  mdiVolumeMute,
} from '../assets/icons'
import { ButtonIcon } from '../components/ButtonIcon'
import { RnIcon } from '../components/RnIcon'
import { RnTouchableOpacity } from '../components/RnTouchableOpacity'
import { v } from '../components/variables'
import { getAuthStore } from '../stores/authStore'
import { getCallStore } from '../stores/callStore'
import { intl } from '../stores/intl'
import { RNInvokeState } from '../stores/RNInvokeStore'
import { Duration } from '../stores/timerStore'
import { InvokeGradient } from './InvokeGradient'
import { KeyPadInvoke } from './KeyPadInvoke'

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
        infoCall.hangupWithUnhold()
        onBackToCall()
      } catch (e) {
        console.log('#Duy Phan console', e)
      }
    }

    return (
      <InvokeGradient>
        <View style={css.container}>
          <View style={css.content}>
            {/* <View style={css.left}>
              <View style={{ height: 130 }}></View>
              <View style={css.keypad}>
                <KeyPadInvoke
                  onPressNumber={() => {}}
                  showKeyboard={() => {}}
                  isHideBackspace
                />
              </View>
              <InvokeGradient
                colors={[
                  'rgb(228,126,123)',
                  'rgb(242,38,32)',
                  'rgb(215,46,39)',
                ]}
                style={css.callBtn}
                locations={[0, 0.5, 0.6]}
              >
                <RnTouchableOpacity
                  onPress={handlePressCall}
                  style={css.callBtn}
                >
                  <Text style={css.endCallText}>{intl`Cutting`}</Text>
                </RnTouchableOpacity>
              </InvokeGradient>
            </View> */}
            <View style={css.right}>
              <View style={css.infoCall}>
                <View style={css.info}>
                  <Text style={css.phone}>
                    {infoCall?.getDisplayName() ?? ''}
                  </Text>
                </View>
                {infoCall?.answered && (
                  <Duration subTitle white center>
                    {infoCall.answeredAt}
                  </Duration>
                )}
              </View>
              <View style={css.empty}>
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
                    {/* <Text style={css.textAction}>{intl`MUTE`}</Text> */}
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
                    {/* <Text style={css.textAction}>{intl`SPEAKER`}</Text> */}
                  </RnTouchableOpacity>
                </View>
              </View>

              <View style={{ width: 200 }}>
                <ButtonIcon
                  path={mdiPhone}
                  bgcolor={v.colors.danger}
                  color='white'
                  onPress={handlePressCall}
                />
              </View>
            </View>
          </View>
        </View>
      </InvokeGradient>
    )
  },
)
