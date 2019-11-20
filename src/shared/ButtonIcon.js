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
    padding: 10,
  },
  ButtonIcon_Name: {
    fontSize: 14,
    paddingTop: 5,
    fontWeight: `500`,
  },
});

const ButtonIcon = ({ size = 24, path, color, ...p }) => (
  <View style={s.ButtonIcon}>
    <TouchableOpacity
      onPress={p.onPress}
      style={[
        s.ButtonIcon_Btn,
        p.style,
        { borderRadius: size * 1.5 },
        { backgroundColor: p.bgcolor },
        p.noborder && { borderWidth: 0 },
        { borderColor: p.bdcolor },
      ]}
    >
      <Svg viewBox="0 0 24 24" width={size} height={size}>
        <Path d={path} fill={color} />
      </Svg>
    </TouchableOpacity>
    {p.name && (
      <Text style={[s.ButtonIcon_Name, p.Textcolor && { color: p.Textcolor }]}>
        {p.name}
      </Text>
    )}
  </View>
);

export default ButtonIcon;
