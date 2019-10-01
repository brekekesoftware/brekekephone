import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const s = StyleSheet.create({
  ButtonIcon: {
    alignItems: `center`,
    marginHorizontal: 10,
  },
  ButtonIcon_Btn: {
    borderWidth: 1,
    borderRadius: 25,
    padding: 5,
  },
  ButtonIcon_Name: {
    fontSize: 14,
    paddingTop: 5,
  },
});

const ButtonIcon = ({ size = 24, path, color, ...p }) => (
  <View style={s.ButtonIcon}>
    <TouchableOpacity onPress={p.onPress} style={[s.ButtonIcon_Btn, p.style]}>
      <Svg viewBox="0 0 24 24" width={size} height={size}>
        <Path d={path} fill={color} />
      </Svg>
    </TouchableOpacity>
    <Text style={s.ButtonIcon_Name}>{p.name}</Text>
  </View>
);

export default ButtonIcon;
