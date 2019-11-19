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

const ButtonIcon = ({ color, path, size = 24, ...p }) => (
  <View style={s.ButtonIcon}>
    <TouchableOpacity
      onPress={p.onPress}
      style={[
        s.ButtonIcon_Btn,
        p.style,
        { borderRadius: size },
        { backgroundColor: p.bgcolor },
        p.noborder && { borderWidth: 0 },
        { borderColor: p.bdcolor },
      ]}
    >
      <Svg height={size} viewBox="0 0 24 24" width={size}>
        <Path d={path} fill={color} />
      </Svg>
    </TouchableOpacity>
    {p.name && (
      <Text style={[s.ButtonIcon_Name, p.textcolor && { color: p.textcolor }]}>
        {p.name}
      </Text>
    )}
  </View>
);

export default ButtonIcon;
