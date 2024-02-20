import { useRef, useState } from 'react'
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native'

import { mdiBookOpenBlank, mdiHistory } from '../assets/icons'
import { RnIcon } from '../components/RnIcon'
import { RnTouchableOpacity } from '../components/RnTouchableOpacity'
import { InCallUI } from './InCallUI'
import { KeyPadTablet } from './KeyPadTablet'

const css = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  main: {
    flex: 1,
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
    width: 90,
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
  },
  infoText: {
    color: 'white',
  },
  empty: {
    flex: 1,
  },
})

export const CallUI = () => {
  const reftxtSelection = useRef({ start: 0, end: 0 })
  const [phone, setPhone] = useState('')
  const [showInCall, setInCall] = useState(false)

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

  if (showInCall) {
    return <InCallUI />
  }

  return (
    <View style={css.container}>
      <ScrollView contentContainerStyle={{ flex: 1, backgroundColor: 'black' }}>
        <View style={css.infoCall}>
          <Text style={css.infoText}>{phone}</Text>
          <View style={css.empty} />
          <Text style={css.infoText}>ver 1.1.1 ZL</Text>
        </View>
        <View style={css.tabView}>
          <View style={[css.tabItem, css.borderLine]}>
            <View style={css.tabValue}>
              <RnIcon path={mdiBookOpenBlank} color='white' />
              <Text style={css.tabText}>Library</Text>
            </View>
          </View>
          <View style={css.tabItem}>
            <View style={css.tabValue}>
              <RnIcon path={mdiHistory} color='white' />
              <Text style={css.tabText}>History</Text>
            </View>
          </View>
        </View>
        <View style={css.main}>
          <KeyPadTablet
            onPressNumber={handlePressNumber}
            showKeyboard={() => {}}
          />
        </View>
        <RnTouchableOpacity style={css.button} onPress={() => setInCall(true)}>
          <Text style={css.textAction}>Call</Text>
        </RnTouchableOpacity>
      </ScrollView>
    </View>
  )
}
