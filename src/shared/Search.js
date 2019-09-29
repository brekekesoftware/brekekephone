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
        style={s.Search_TextInput}
        placeholder="Search name, phone number..."
        value={p.value}
        onChangeText={p.onValueChange}
      />
    </View>
    {!!p.value && (
      <TouchableOpacity
        style={s.Search_BtnClose}
        transparent
        onPress={() => p.onValueChange(``)}
      >
        <Icon path={mdiClose} size={17} />
      </TouchableOpacity>
    )}
  </View>
);

export default Search;
