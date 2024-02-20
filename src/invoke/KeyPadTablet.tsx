import { StyleSheet, Text, View } from 'react-native'

import { mdiBackspace } from '../assets/icons'
import { RnIcon, RnText, RnTouchableOpacity } from '../components/Rn'
import { v } from '../components/variables'

const css = StyleSheet.create({
  KeyPad_Number: {
    flexDirection: 'row',
    flex: 1,
  },
  KeyPad_NumberTxt: {
    fontSize: 35,
    fontWeight: '600',
    textAlign: 'center',
    paddingTop: 15,
    color: 'white',
  },
  KeyPad_Txt: {
    fontSize: 15,
    color: 'white',
    paddingTop: 6,
    textAlign: 'center',
  },
  KeyPad_NumberBtn: {
    width: '33.3%',
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  KeyPad_Btn: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    flexDirection: 'row',
  },
  KeyPad_Border: {
    borderRightColor: 'white',
    borderRightWidth: 1,
  },
  KeyPad_BorderBottom: {
    borderBottomColor: 'white',
    borderBottomWidth: 1,
  },
  KeyPad_Btn__call: {
    backgroundColor: v.colors.primary,
    width: 64,
    borderRadius: 40,
    paddingVertical: 20,
  },
  KeyPad_Btn__call_2: {
    backgroundColor: v.colors.primary,
    width: 50,
    height: 50,
    justifyContent: 'center',
    borderRadius: 25,
  },
  KeyPad_view: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: v.colors.primaryFn(0.5),
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    borderRadius: 50 / 2,
  },
  PhoneView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  PhoneTxt: {
    color: 'white',
    fontSize: 30,
  },
  KeyPad_Backspace: {
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    position: 'relative',
  },
  KeyPad_Number_Backspace: {
    width: 200,
    color: 'white',
    alignItems: 'flex-end',
    position: 'absolute',
    right: 10,
  },
})

const keys = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
]

const characters = [
  ['', 'ABC', 'DEF'],
  ['GHI', 'JKL', 'MNO'],
  ['PQRS', 'TUV', 'WXYZ'],
  ['', '+', ''],
]

export const KeyPadTablet = (p: {
  onPressNumber(k: string): void
  showKeyboard(): void
  callVoice?(): void
  callVoiceForward?(): void
  isHideBackspace?: boolean
  phone?: string
}) => (
  <>
    {!p.isHideBackspace && (
      <View style={css.KeyPad_Backspace}>
        <View style={css.PhoneView}>
          <Text style={css.PhoneTxt}>{p.phone ?? ''}</Text>
        </View>
        <RnTouchableOpacity
          onPress={() => p.onPressNumber('')}
          style={css.KeyPad_Number_Backspace}
        >
          <RnIcon path={mdiBackspace} color='white' size={30} />
        </RnTouchableOpacity>
      </View>
    )}
    {keys.map((row, i) => (
      <View key={i} style={css.KeyPad_Number}>
        {row.map((key, inD) => (
          <RnTouchableOpacity
            key={key}
            onPress={() => p.onPressNumber(key)}
            style={[
              css.KeyPad_NumberBtn,
              row.length - 1 !== inD ? css.KeyPad_Border : undefined,
              keys.length - 1 !== i ? css.KeyPad_BorderBottom : undefined,
            ]}
          >
            <View style={css.KeyPad_Btn}>
              <RnText style={css.KeyPad_NumberTxt}>{key}</RnText>
              <RnText style={css.KeyPad_Txt}>{characters[i][inD]}</RnText>
            </View>
          </RnTouchableOpacity>
        ))}
      </View>
    ))}
  </>
)
