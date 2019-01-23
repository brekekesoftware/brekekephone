import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { std, rem } from '../styleguide';

const st = StyleSheet.create({
  notify: {
    width: rem(320),
    backgroundColor: std.color.notice,
    marginBottom: std.gap.lg,
    alignSelf: 'flex-start',
    borderTopRightRadius: std.gap.md,
    borderBottomRightRadius: std.gap.md,
    shadowColor: std.color.shade9,
    shadowRadius: rem(8),
    shadowOpacity: 0.24,
    shadowOffset: {
      width: 0,
      height: rem(4),
    },
    elevation: 3,
  },
  notifyTitle: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.sm * 2,
    color: std.color.shade0,
    paddingHorizontal: std.gap.lg,
    paddingVertical: std.gap.md,
  },
});

const Notify = p => (
  <View style={st.notify}>
    <Text style={st.notifyTitle}>{p.message}</Text>
  </View>
);

const ToastsNotify = p =>
  p.toastIds.map(id => <Notify key={id} {...p.resolveToast(id)} />);

export default ToastsNotify;
