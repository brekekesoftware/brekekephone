import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    color: std.color.shade9,
  },
  navbarAction: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.action,
  },
});

const Main = p => (
  <View style={st.container}>
    <View style={st.navbar}>
      <Text style={st.navbarTitle}>{p.title}</Text>
      {p.onBack && (
        <TouchableOpacity style={st.navbarBack} onPress={p.onBack}>
          <Text style={st.navbarAction}>{p.backLabel || 'Back'}</Text>
        </TouchableOpacity>
      )}
      {p.onNext && (
        <TouchableOpacity style={st.navbarNext} onPress={p.onNext}>
          <Text style={st.navbarAction}>{p.nextLabel || 'Next'}</Text>
        </TouchableOpacity>
      )}
    </View>
    {p.children}
  </View>
);

export default Main;
