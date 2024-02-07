import { useRef, useState } from 'react'
import {
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputSelectionChangeEventData,
  View,
} from 'react-native'
import { Button } from 'react-native-share'

import { mdiBookOpenBlank, mdiHistory } from '../assets/icons'
import { KeyPad } from '../components/CallKeyPad'
import { ShowNumber } from '../components/CallShowNumbers'
import { RnIcon } from '../components/RnIcon'
import { RnTouchableOpacity } from '../components/RnTouchableOpacity'
import { InCallUI } from './InCallUI'

const css = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'black'
  },
  main: {
    flex: 1,
    position: 'relative',
  },
  button: {
    backgroundColor: 'rgb(242,144,0)',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textAction: {
    color: 'white',
    fontSize: 15,
  },
  tabView: {
    height: 50,
    flexDirection: 'row',
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
    width: 80,
  },
  textPhone: {
    textAlign: 'center',
  },
})

export const CallUI = () => {
  const refNumber = useRef<TextInput>(null)
  const reftxtSelection = useRef({ start: 0, end: 0 })
  const [phone, setPhone] = useState('')

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

  const handlePressButton = () => {}

  // return <InCallUI />

  return (
    <View style={css.container}>
      <ScrollView>
        <ShowNumber
          refInput={refNumber}
          selectionChange={(
            e: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
          ) => {
            // Object.assign(this.txtSelection, {
            //   start: e.nativeEvent.selection.end,
            //   end: e.nativeEvent.selection.end,
            // })
            console.log('#Duy Phan console', e)
          }}
          setTarget={(v: string) => {
            console.log('#Duy Phan console', v)
          }}
          value={phone}
        />
        <View style={css.tabView}>
          <View style={css.tabItem}>
            <View style={css.tabValue}>
              <RnIcon path={mdiBookOpenBlank} color='black' />
              <Text>Library</Text>
            </View>
          </View>
          <View style={css.tabItem}>
            <View style={css.tabValue}>
              <RnIcon path={mdiHistory} color='black' />
              <Text>History</Text>
            </View>
          </View>
        </View>
        <View style={css.main}>
          <KeyPad onPressNumber={handlePressNumber} showKeyboard={() => {}} />
        </View>
        <RnTouchableOpacity style={css.button}>
          <Text style={css.textAction}>Call</Text>
        </RnTouchableOpacity>
      </ScrollView>
    </View>
  )
}
