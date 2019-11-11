import React from 'react';

import g from '../global';
import { StyleSheet, Text, TouchableOpacity, View } from '../native/Rn';
import v from '../variables';

const s = StyleSheet.create({
  ShowNumbers: {
    flexDirection: `column`,
  },
  ShowNumbers_BtnOuter: {
    flexDirection: `row`,
  },
  ShowNumbers_BtnTxt: {
    fontSize: v.fontSizeSmall,
  },
  ShowNumbers_Btn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
    backgroundColor: v.mainDarkBg,
  },
  ShowNumbers_Btn__callpark: {
    position: `absolute`,
    top: 10,
    right: 120,
  },
  ShowNumbers_Btn__voicecall: {
    position: `absolute`,
    top: 10,
    right: 10,
  },
  ShowNumbers_Display: {
    position: `absolute`,
    top: 65,
    left: 20,
  },
  ShowNumbers_DisplayTxt: {
    fontSize: 32,
    paddingVertical: 15,
  },
});

const ShowNumber = p => (
  <View style={s.ShowNumbers}>
    <View style={s.ShowNumbers_BtnOuter}>
      <TouchableOpacity
        style={[s.ShowNumbers_Btn, s.ShowNumbers_Btn__callpark]}
        onPress={() => g.goToCallPark(`page_phone`)}
      >
        <Text style={s.ShowNumbers_BtnTxt}>CALL PARK (1)</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[s.ShowNumbers_Btn, s.ShowNumbers_Btn__voicecall]}
      >
        <Text style={s.ShowNumbers_BtnTxt}>VOICEMAIL (2)</Text>
      </TouchableOpacity>
    </View>
    <View style={s.ShowNumbers_Display}>
      <Text style={s.ShowNumbers_DisplayTxt}>
        {p.showNum !== `` ? p.showNum : `Your number`}
      </Text>
    </View>
  </View>
);

export default ShowNumber;
