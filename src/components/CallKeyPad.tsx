import { Platform, StyleSheet, View } from 'react-native'

import {
  mdiBackspace,
  mdiKeyboard,
  mdiPhone,
  mdiPhoneForward,
} from '../assets/icons'
import { RnIcon, RnText, RnTouchableOpacity } from './Rn'
import { v } from './variables'

const css = StyleSheet.create({
  KeyPad_Number: {
    flexDirection: 'row',
  },
  KeyPad_NumberTxt: {
    fontSize: v.fontSizeTitle,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 20,
  },
  KeyPad_NumberBtn: {
    width: '33.3%',
  },
  KeyPad_Btn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    // paddingVertical: 10,
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

export const KeyPad = (p: {
  onPressNumber(k: string): void
  showKeyboard(): void
  callVoice?(): void
  callVoiceForward?(): void
}) => (
  <>
    {keys.map((row, i) => (
      <View key={i} style={css.KeyPad_Number}>
        {row.map(key => (
          <RnTouchableOpacity
            key={key}
            onPress={() => p.onPressNumber(key)}
            style={css.KeyPad_NumberBtn}
          >
            <RnText style={css.KeyPad_NumberTxt}>{key}</RnText>
          </RnTouchableOpacity>
        ))}
      </View>
    ))}
    <View style={css.KeyPad_Btn}>
      <RnTouchableOpacity onPress={p.showKeyboard} style={css.KeyPad_NumberBtn}>
        <RnIcon
          color={Platform.OS === 'web' ? 'white' : undefined}
          path={mdiKeyboard}
        />
      </RnTouchableOpacity>
      <View style={p.callVoiceForward ? css.KeyPad_view : {}}>
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
    </View>
  </>
)
