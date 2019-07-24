import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {Icon} from 'native-base';
import { std } from '../styleguide';

const st = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: std.color.shade3,
  },
  navbar: {
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: std.gap.sm,
    backgroundColor: std.color.shade1,
  },
  navbarBack: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: std.gap.lg,
    paddingRight: std.gap.lg,
  },
  navbarNext: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: std.gap.lg,
    paddingLeft: std.gap.lg,
  },
  navbarTitle: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    fontWeight: '700',
    color: std.color.shade9,
  },
  navbarActionBack: {
    fontFamily: std.font.icon,
    fontSize: std.textSize.lg,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.shade9,
    paddingTop: std.gap.sm,
  },
  navbarAction: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.action,
  },
  navbarReset: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: std.gap.lg,
  },
  navbarActionReset: {
    fontSize: std.textSize.sm,
    fontFamily: std.font.text,
    lineHeight: std.textSize.sm + std.gap.sm * 2,
    paddingTop: std.gap.lg,
    fontWeight: 'bold',
    paddingBottom: std.gap.lg,
  },
});

const Main = p => (
  <View style={st.container}>
    <View style={st.navbar}>
      <Text style={st.navbarTitle}>{p.title}</Text>
      {p.onBack && (
        <TouchableOpacity style={st.navbarBack}>
          <Icon name="arrow-back" type="MaterialIcons"/>
        </TouchableOpacity>
      )}
      {p.onNext && (
        <TouchableOpacity style={st.navbarNext}>
          <Text style={st.navbarAction}>{p.nextLabel || 'Next'}</Text>
        </TouchableOpacity>
      )}
      {p.onReset && (
        <TouchableOpacity style={st.navbarReset}>
          <Text style={st.navbarActionReset}>RESET</Text>
        </TouchableOpacity>
      )}
    </View>
    {p.children}
  </View>
);

export default Main;
