import { mdiClose } from '@mdi/js';
import React from 'react';

import { Icon, StyleSheet, TextInput, TouchableOpacity, View } from '../-/Rn';
import g from '../global';

const css = StyleSheet.create({
  Search: {
    height: 50,
  },
  Search_TextInputOuter: {
    paddingTop: 5,
    paddingHorizontal: 10,
  },
  Search_TextInput: {
    padding: 10,
    ...g.boxShadow,
  },
  Search_BtnClose: {
    position: `absolute`,
    right: 10,
    top: 5,
    padding: 10,
  },
});

const Search = p => (
  <View style={css.Search}>
    <View style={css.Search_TextInputOuter}>
      <TextInput
        onChangeText={p.onValueChange}
        placeholder="Search name, phone number..."
        style={css.Search_TextInput}
        value={p.value}
      />
    </View>
    {!!p.value && (
      <TouchableOpacity
        onPress={() => p.onValueChange(``)}
        style={css.Search_BtnClose}
        transparent
      >
        <Icon path={mdiClose} size={17} />
      </TouchableOpacity>
    )}
  </View>
);

export default Search;
