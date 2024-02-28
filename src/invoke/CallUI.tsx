import { observer } from 'mobx-react'
import { useEffect, useRef, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

import { mdiBookOpenBlank, mdiHistory } from '../assets/icons'
import { RnIcon } from '../components/RnIcon'
import { RnTouchableOpacity } from '../components/RnTouchableOpacity'
import { getCallStore } from '../stores/callStore'
import { intl } from '../stores/intl'
import { RNInvokeState } from '../stores/RNInvokeStore'
import { InCallUI } from './InCallUI'
import { InComingCallUI } from './InComingCallUI'
import { KeyPadTablet } from './KeyPadTablet'

const css = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    zIndex: 99999,
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
  main: {
    flex: 1,
    backgroundColor: 'rgb(135,135,135)',
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

export const CallUI = observer(() => {
  const reftxtSelection = useRef({ start: 0, end: 0 })
  const [phone, setPhone] = useState('')
  const [showInCall, setInCall] = useState('call')

  const { callTo } = RNInvokeState

  useEffect(() => {
    if (callTo) {
      getCallStore().startCall(callTo)
      setInCall('incall')
    }
  }, [callTo])

  const handlePressNumber = v => {
    const { end, start } = reftxtSelection.current
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
    reftxtSelection.current.start = p
    reftxtSelection.current.end = p
  }

  if (showInCall === 'incoming') {
    return <InComingCallUI onBackToCall={() => setInCall('incall')} />
  }

  if (showInCall === 'incall') {
    return <InCallUI onBackToCall={() => setInCall('call')} />
  }

  return (
    <View style={css.container}>
      <ScrollView contentContainerStyle={{ flex: 1, backgroundColor: 'black' }}>
        <View style={css.infoCall}>
          <Text style={css.infoText}>3002</Text>
          <View style={css.empty} />
          <Text style={css.infoText}>ver 1.1.1 ZL</Text>
        </View>
        <View style={css.tabView}>
          <View style={[css.tabItem, css.borderLine]}>
            <View style={css.tabValue}>
              <View>
                <RnIcon path={mdiBookOpenBlank} color='white' />
              </View>

              <Text style={css.tabText}>{intl`Phonebook`}</Text>
            </View>
          </View>
          <View style={css.tabItem}>
            <View style={css.tabValue}>
              <View>
                <RnIcon path={mdiHistory} color='white' />
              </View>
              <Text style={css.tabText}>{intl`Call history`}</Text>
            </View>
          </View>
        </View>
        <View style={css.main}>
          <KeyPadTablet
            onPressNumber={handlePressNumber}
            showKeyboard={() => {}}
            phone={phone}
          />
        </View>
        <RnTouchableOpacity
          style={css.button}
          onPress={() => setInCall('incoming')}
        >
          <Text style={css.textAction}>{intl`Call`}</Text>
        </RnTouchableOpacity>
      </ScrollView>
    </View>
  )
})
