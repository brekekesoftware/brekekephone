import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from '../native/Rn';
import v from '../variables';

const s = StyleSheet.create({
  ShowNumbers: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  ShowNumbers_Btn: {
    flexDirection: 'row',
    position: 'absolute',
    top: 10,
    right: 10,
  },
  ShowNumbers_BtnTxt: {
    fontSize: v.fontSizeSmall,
  },
  ShowNumbers_Btn__call: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 5,
    borderRadius: 3,
    backgroundColor: v.mainDarkBg,
  },
  ShowNumbers_Display: {
    position: 'absolute',
    top: 45,
    left: 20,
  },
  ShowNumbers_DisplayTxt: {
    fontSize: 32,
  },
});

const ShowNumber = p => (
  <View style={s.ShowNumbers}>
    <View style={s.ShowNumbers_Btn}>
      <TouchableOpacity style={s.ShowNumbers_Btn__call}>
        <Text style={s.ShowNumbers_BtnTxt}>CALL PARK (1)</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.ShowNumbers_Btn__call}>
        <Text style={s.ShowNumbers_BtnTxt}>VOICEMAIL (2)</Text>
      </TouchableOpacity>
    </View>
    <View style={s.ShowNumbers_Display}>
      <Text style={s.ShowNumbers_DisplayTxt}>
        {p.showNum !== '' ? p.showNum : 'Your number'}
      </Text>
    </View>
  </View>
);

export default ShowNumber;
