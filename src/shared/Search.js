import { mdiClose } from '@mdi/js';
import React from 'react';

import { StyleSheet, TextInput, TouchableOpacity, View } from '../native/Rn';
import v from '../variables';
import Icon from './Icon';

const s = StyleSheet.create({
  Search: {
    height: 50,
  },
  Search_TextInputOuter: {
    paddingTop: 5,
    paddingHorizontal: 10,
  },
  Search_TextInput: {
    padding: 10,
    ...v.boxShadow,
  },
  Search_BtnClose: {
    position: `absolute`,
    right: 10,
    top: 5,
    padding: 10,
  },
});

const Search = p => (
  <View style={s.Search}>
    <View style={s.Search_TextInputOuter}>
      <TextInput
        onChangeText={p.onValueChange}
        placeholder="Search name, phone number..."
        style={s.Search_TextInput}
        value={p.value}
      />
    </View>
    {!!p.value && (
      <TouchableOpacity
        onPress={() => p.onValueChange(``)}
        style={s.Search_BtnClose}
        transparent
      >
        <Icon path={mdiClose} size={17} />
      </TouchableOpacity>
    )}
  </View>
);

export default Search;
