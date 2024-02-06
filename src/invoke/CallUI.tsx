import { StyleSheet, Text, View } from 'react-native'
import { Button } from 'react-native-share'

import { KeyPad } from '../components/CallKeyPad'
import { RnTouchableOpacity } from '../components/RnTouchableOpacity'
import { InCallUI } from './InCallUI'

const css = StyleSheet.create({
  container: {
    flex: 1,
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
})

export const CallUI = () => {
  const handlePressNumber = () => {
    console.log('#Duy Phan console')
  }

  const handlePressButton = () => {}

  return (
    <View style={css.container}>
      <Text>Phone</Text>
      <View style={css.tabView}>
        <View style={css.tabItem}>
          <Text>Library</Text>
        </View>
        <View style={css.tabItem}>
          <Text>History</Text>
        </View>
      </View>
      <View style={css.main}>
        <KeyPad onPressNumber={handlePressNumber} showKeyboard={() => {}} />
      </View>
      <RnTouchableOpacity style={css.button}>
        <Text style={css.textAction}>Call</Text>
      </RnTouchableOpacity>
    </View>
  )
}
