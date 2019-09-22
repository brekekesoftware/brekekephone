import { mdiClose } from '@mdi/js';
import React from 'react';

import { StyleSheet, TextInput, TouchableOpacity, View } from '../native/Rn';
import v from '../variables';
import Icon from './Icon';

const s = StyleSheet.create({
  Search: {
    height: 50,
  },
  Search_TextInput: {
    paddingTop: 5,
    paddingHorizontal: 10,
  },
  Search_TextInput__pd: {
    padding: 10,
    ...v.boxShadow,
  },
  Search_BtnClose: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
});

const Search = p => (
  <View style={s.Search}>
    <View style={s.Search_TextInput}>
      <TextInput
        style={s.Search_TextInput__pd}
        placeholder="Search name, phone number..."
        value={p.value}
        onChangeText={p.onValueChange}
      />
    </View>
    {!!p.value && (
      <TouchableOpacity
        style={s.Search_BtnClose}
        transparent
        onPress={() => p.onValueChange('')}
      >
        <Icon path={mdiClose} size={18} />
      </TouchableOpacity>
    )}
  </View>
);

export default Search;
