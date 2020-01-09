import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const css = StyleSheet.create({
  ButtonIcon: {
    alignItems: `center`,
    marginHorizontal: 5,
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
  <View style={css.ButtonIcon}>
    <TouchableOpacity
      onPress={p.onPress}
      style={[
        css.ButtonIcon_Btn,
        p.style,
        { borderRadius: size * 1.5 },
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
      <Text
        style={[css.ButtonIcon_Name, p.textcolor && { color: p.textcolor }]}
      >
        {p.name}
      </Text>
    )}
  </View>
);

export default ButtonIcon;
