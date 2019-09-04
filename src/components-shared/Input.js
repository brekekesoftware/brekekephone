import React from 'react';
import { StyleSheet, Text, TextInput as TextInputOg, View } from 'react-native';

import { std } from '../-/styleguide';

const st = StyleSheet.create({
  container: {
    padding: std.gap.lg,
    paddingTop: std.gap.lg,
  },

  label: {
    paddingBottom: std.gap.md,
    fontFamily: std.font.text,
    fontSize: std.textSize.sm,
    color: std.color.shade5,
  },

  required: {
    paddingRight: 5,
    color: std.color.danger,
  },

  input: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    height: std.textSize.md + std.gap.lg * 2,
    borderColor: std.color.shade4,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 3,
    padding: std.gap.lg,
    color: std.color.shade9,
    backgroundColor: std.color.shade0,
  },
});

const normalizeInput = Inner => {
  const Outer = p => {
    const { label, required, ...props } = p;

    return (
      <View style={st.container}>
        <Text style={st.label}>
          {required && <Text style={st.required}>*</Text>}
          {label}:
        </Text>
        <Inner {...props} />
      </View>
    );
  };

  return Outer;
};

const TextInput = normalizeInput(p => (
  <TextInputOg
    placeholder={p.placeholder}
    style={st.input}
    value={p.value}
    onChangeText={p.onChange}
    onSubmitEditing={p.onSubmit}
  />
));

export { st, TextInput };
