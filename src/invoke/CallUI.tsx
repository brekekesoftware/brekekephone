import { observer } from 'mobx-react'
import { useEffect, useRef, useState } from 'react'
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native'

import { RnTouchableOpacity } from '../components/RnTouchableOpacity'
import { getCallStore } from '../stores/callStore'
import { intl } from '../stores/intl'
import { RNInvokeState } from '../stores/RNInvokeStore'
import { InCallUI } from './InCallUI'
import { InComingCallUI } from './InComingCallUI'
import { KeyPadInvoke } from './KeyPadInvoke'

const css = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    zIndex: 9999,
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
  main: {
    flex: 1,
    marginRight: -2,
  },
  button: {
    backgroundColor: 'rgb(242,144,0)',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textAction: {
    color: 'white',
    fontSize: 18,
  },
  tabView: {
    height: 70,
    flexDirection: 'row',
    backgroundColor: 'black',
    paddingBottom: 20,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabValue: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  textPhone: {
    textAlign: 'center',
  },
  tabText: {
    color: 'white',
    fontSize: 18,
  },
  borderLine: {
    borderRightColor: 'white',
    borderRightWidth: 1,
  },
  infoCall: {
    flexDirection: 'row',
    backgroundColor: 'rgb(34,86,154)',
    paddingHorizontal: 5,
    paddingVertical: 4,
  },
  infoText: {
    color: 'white',
  },
  empty: {
    flex: 1,
  },
})

export type TScreen = 'keypad' | 'incall' | 'incoming'

export const CallUI = observer(() => {
  const refTxtSelection = useRef({ start: 0, end: 0 })
  const refCallPrevLength = useRef(0)
  const [phone, setPhone] = useState('')
  const [screen, setScreen] = useState<TScreen>('keypad')

  const { callTo, timeNow } = RNInvokeState
  const callStore = getCallStore()
  const callLength = callStore.calls.length

  const invokeToApp = async () => {
    try {
      await Linking.openURL('brekekephonedevinvokeexample://open')
    } catch (e) {
      console.log('#Duy Phan console', e)
    }
  }

  useEffect(() => {
    if (callTo) {
      callStore.startCall(callTo)
      setScreen('incall')
      return
    }
    setScreen('keypad')
    setPhone('')
  }, [timeNow])

  useEffect(() => {
    if (refCallPrevLength.current && !callLength && screen === 'incall') {
      invokeToApp()
    }
    refCallPrevLength.current = callLength
  }, [callLength])

  const handlePressNumber = v => {
    const { end, start } = refTxtSelection.current
    let min = Math.min(start, end)
    const max = Math.max(start, end)
    const isDelete = v === ''
    if (isDelete) {
      if (start === end && start) {
        min = min - 1
      }
    }
    setPhone(phone.substring(0, min) + v + phone.substring(max))
    const p = min + (isDelete ? 0 : 1)
    refTxtSelection.current.start = p
    refTxtSelection.current.end = p
  }

  const makeCall = () => {
    if (!phone) {
      return
    }
    getCallStore().startCall(phone)
    setScreen('incall')
  }

  if (screen === 'incoming') {
    return <InComingCallUI onBackToCall={() => setScreen('incall')} />
  }

  if (screen === 'incall') {
    return <InCallUI onBackToCall={() => setScreen('keypad')} />
  }

  return (
    <View style={css.container}>
      <ScrollView contentContainerStyle={{ flex: 1, backgroundColor: 'black' }}>
        <View style={css.main}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: 'white',
                fontSize: 24,
                textAlign: 'center',
                paddingTop: 15,
              }}
            >
              Keypad
            </Text>
          </View>
          <View style={{ flex: 3 }}>
            <KeyPadInvoke
              onPressNumber={handlePressNumber}
              showKeyboard={() => {}}
              phone={phone}
            />
          </View>
        </View>
        <RnTouchableOpacity style={css.button} onPress={makeCall}>
          <Text style={css.textAction}>{intl`Call`}</Text>
        </RnTouchableOpacity>
      </ScrollView>
    </View>
  )
})
