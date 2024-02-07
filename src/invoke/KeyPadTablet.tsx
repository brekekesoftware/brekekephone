import { Platform, StyleSheet, View } from 'react-native'

import {
  mdiBackspace,
  mdiKeyboard,
  mdiPhone,
  mdiPhoneForward,
} from '../assets/icons'
import { RnIcon, RnText, RnTouchableOpacity } from '../components/Rn'
import { v } from '../components/variables'

const css = StyleSheet.create({
  KeyPad_Number: {
    flexDirection: 'row',
    flex: 1,
  },
  KeyPad_NumberTxt: {
    fontSize: 30,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 20,
    color: 'white',
  },
  KeyPad_NumberBtn: {
    width: '33.3%',
    backgroundColor: 'black',
    // height: 120,
    borderBottomColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  KeyPad_Border: {
    borderRightColor: 'white',
    borderRightWidth: 1,
  },
  KeyPad_Btn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
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
})

const keys = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
]

export const KeyPadTablet = (p: {
  onPressNumber(k: string): void
  showKeyboard(): void
  callVoice?(): void
  callVoiceForward?(): void
}) => (
  <>
    {keys.map((row, i) => (
      <View key={i} style={css.KeyPad_Number}>
        {row.map((key, inD) => (
          <RnTouchableOpacity
            key={key}
            onPress={() => p.onPressNumber(key)}
            style={[
              css.KeyPad_NumberBtn,
              row.length - 1 !== inD ? css.KeyPad_Border : undefined,
            ]}
          >
            <RnText style={css.KeyPad_NumberTxt}>{key}</RnText>
          </RnTouchableOpacity>
        ))}
      </View>
    ))}
    {/* <View style={css.KeyPad_Btn}>
      <RnTouchableOpacity onPress={p.showKeyboard} style={css.KeyPad_NumberBtn}>
        <RnIcon
          color={Platform.OS === 'web' ? 'white' : undefined}
          path={mdiKeyboard}
        />
      </RnTouchableOpacity>
      <View style={p.callVoiceForward ? css.KeyPad_view : undefined}>
        {p.callVoiceForward && (
          <RnTouchableOpacity
            onPress={p.callVoiceForward}
            style={[css.KeyPad_NumberBtn, css.KeyPad_Btn__call_2]}
          >
            <RnIcon path={mdiPhoneForward} />
          </RnTouchableOpacity>
        )}
        {p.callVoice && (
          <RnTouchableOpacity
            onPress={p.callVoice}
            style={[
              css.KeyPad_NumberBtn,
              !p.callVoiceForward
                ? css.KeyPad_Btn__call
                : css.KeyPad_Btn__call_2,
            ]}
          >
            <RnIcon path={mdiPhone} />
          </RnTouchableOpacity>
        )}
      </View>
      <RnTouchableOpacity
        onPress={() => p.onPressNumber('')}
        style={css.KeyPad_NumberBtn}
      >
        <RnIcon path={mdiBackspace} />
      </RnTouchableOpacity>
    </View> */}
  </>
)
